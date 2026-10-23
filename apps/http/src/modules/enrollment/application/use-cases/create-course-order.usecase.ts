import { CreateCourseCheckoutOrderDto, CheckoutOrderResult } from "../../domain/dtos/enrollment.dto";
import { ValidateCouponUseCase } from "@/modules/coupon/application/use-cases/validate-coupon.usecase";
import { IPaymentOrderGateway } from "@/shared/application/ports/payment.port";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { IWalletRepository } from "@/modules/wallet/domain/repositories/wallet.repository.interface";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class CreateCourseCheckoutOrderUseCase {
  constructor(
    private readonly validateCouponUseCase: ValidateCouponUseCase,
    private readonly paymentGateway: IPaymentOrderGateway,
    private readonly courseRepo: ICourseRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly walletRepo: IWalletRepository
  ) {}

  async execute(studentId: string, dto: CreateCourseCheckoutOrderDto): Promise<CheckoutOrderResult> {
    const course = await this.courseRepo.findById(dto.courseId);

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.isFrozen || course.isDeleted) {
      throw new BadRequestError("This course is currently not accepting enrollments.");
    }

    // Check existing enrollment status
    const existing = await this.enrollmentRepo.findEnrollmentByStudentAndCourse(studentId, dto.courseId);
    if (existing) {
      if (existing.status === "ACTIVE") {
        throw new ConflictError("You are already actively enrolled in this course.");
      }
      if (existing.status === "REFUNDED") {
        throw new BadRequestError("You previously claimed a full refund for this course under our 20-Day Guarantee and are not eligible to re-enroll.");
      }
      if (existing.status === "CANCELLED") {
        throw new BadRequestError("Your previous enrollment for this course was cancelled and is not eligible for re-enrollment.");
      }
    }

    const originalPrice = Number(course.price);
    if (originalPrice <= 0 || course.pricingType === "FREE") {
      throw new BadRequestError("This course is free. Please use the free enrollment endpoint.");
    }

    let couponDiscount = 0;
    let appliedCouponCode: string | null = null;

    // Validate and apply teacher coupon if provided
    if (dto.couponCode) {
      const couponValidation = await this.validateCouponUseCase.execute({
        code: dto.couponCode,
        courseId: dto.courseId,
        studentId,
      });

      if (!couponValidation.isValid) {
        throw new BadRequestError(couponValidation.message || "Invalid coupon code.");
      }

      couponDiscount = couponValidation.discountAmount;
      appliedCouponCode = couponValidation.code || dto.couponCode.trim().toUpperCase();
    }

    const priceAfterCoupon = Math.max(0, originalPrice - couponDiscount);
    let walletDeductedAmount = 0;

    // Apply wallet balance if requested
    if (dto.useWalletBalance && priceAfterCoupon > 0) {
      const wallet = await this.walletRepo.findByUserId(studentId);
      const availableBalance = wallet ? Number(wallet.balance) : 0;
      walletDeductedAmount = Math.min(availableBalance, priceAfterCoupon);
    }

    const finalPayableAmount = Number((priceAfterCoupon - walletDeductedAmount).toFixed(2));

    // If fully covered by wallet
    if (finalPayableAmount === 0) {
      const internalOrderId = `order_wallet_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        orderId: internalOrderId,
        courseId: course.id,
        courseTitle: course.title,
        originalPrice,
        couponDiscount,
        appliedCouponCode,
        walletDeductedAmount,
        finalPayableAmount: 0,
        currency: course.currency || "INR",
        isFullyPaidByWallet: true,
      };
    }

    // Create Razorpay Gateway Order
    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    const gatewayOrder = await this.paymentGateway.createOrder({
      amount: finalPayableAmount,
      currency: course.currency || "INR",
      receipt,
      notes: {
        studentId,
        courseId: course.id,
        couponCode: appliedCouponCode || "",
        walletDeductedAmount: walletDeductedAmount.toString(),
      },
    });

    return {
      orderId: gatewayOrder.orderId,
      courseId: course.id,
      courseTitle: course.title,
      originalPrice,
      couponDiscount,
      appliedCouponCode,
      walletDeductedAmount,
      finalPayableAmount,
      currency: course.currency || "INR",
      isFullyPaidByWallet: false,
      razorpayKeyId: gatewayOrder.keyId || process.env.RAZORPAY_KEY_ID || "",
    };
  }
}
