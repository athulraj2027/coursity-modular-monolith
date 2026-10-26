import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiResponse, PaginationMeta } from "../src/shared/utils/api-response";
import { STATUS_CODES } from "../src/app/config/status";

// Lightweight mock Express Response
function createMockResponse() {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
    send() {
      return this;
    },
  };
  return res;
}

describe("ApiResponse Common Response Model", () => {
  describe("ApiResponse.success", () => {
    it("should return standard 200 success response with data and default message", () => {
      const res = createMockResponse();
      const payload = { userId: "123", name: "Alice" };

      ApiResponse.success(res, payload);

      assert.equal(res.statusCode, STATUS_CODES.OK);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, "Success");
      assert.deepEqual(res.body.data, payload);
      assert.ok(res.body.timestamp);
      assert.doesNotThrow(() => new Date(res.body.timestamp));
    });

    it("should support custom message, metadata, and status code", () => {
      const res = createMockResponse();
      const data = [1, 2, 3];
      const meta = { executionTimeMs: 42 };

      ApiResponse.success(res, data, "Numbers fetched", meta, STATUS_CODES.ACCEPTED);

      assert.equal(res.statusCode, STATUS_CODES.ACCEPTED);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, "Numbers fetched");
      assert.deepEqual(res.body.data, data);
      assert.deepEqual(res.body.meta, meta);
    });

    it("should handle undefined data without serializing undefined", () => {
      const res = createMockResponse();

      ApiResponse.success(res, undefined, "Action completed");

      assert.equal(res.statusCode, STATUS_CODES.OK);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, "Action completed");
      assert.equal(res.body.data, undefined);
    });
  });

  describe("ApiResponse.created", () => {
    it("should return 201 Created status with resource data", () => {
      const res = createMockResponse();
      const newCourse = { id: "c_1", title: "React 19 Mastery" };

      ApiResponse.created(res, newCourse, "Course created successfully");

      assert.equal(res.statusCode, STATUS_CODES.CREATED);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, "Course created successfully");
      assert.deepEqual(res.body.data, newCourse);
    });

    it("should use default message when omitted", () => {
      const res = createMockResponse();

      ApiResponse.created(res, { id: "xyz" });

      assert.equal(res.statusCode, STATUS_CODES.CREATED);
      assert.equal(res.body.message, "Resource created successfully");
    });
  });

  describe("ApiResponse.noContent", () => {
    it("should set status to 204 and send empty response", () => {
      const res = createMockResponse();

      ApiResponse.noContent(res);

      assert.equal(res.statusCode, STATUS_CODES.NO_CONTENT);
      assert.equal(res.body, null);
    });
  });

  describe("ApiResponse.paginated", () => {
    it("should return paginated array with automatically computed pagination meta", () => {
      const res = createMockResponse();
      const items = [{ id: "1" }, { id: "2" }, { id: "3" }];

      ApiResponse.paginated(res, items, {
        total: 50,
        page: 2,
        limit: 10,
      });

      assert.equal(res.statusCode, STATUS_CODES.OK);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.data, items);
      assert.deepEqual(res.body.meta, {
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it("should compute hasNextPage as false on last page", () => {
      const res = createMockResponse();
      const items = [{ id: "10" }];

      ApiResponse.paginated(res, items, {
        total: 25,
        page: 3,
        limit: 10,
      });

      assert.equal(res.body.meta.page, 3);
      assert.equal(res.body.meta.totalPages, 3);
      assert.equal(res.body.meta.hasNextPage, false);
      assert.equal(res.body.meta.hasPrevPage, true);
    });
  });

  describe("ApiResponse.error", () => {
    it("should return standard error response with 500 default status", () => {
      const res = createMockResponse();

      ApiResponse.error(res, "Database query failed");

      assert.equal(res.statusCode, STATUS_CODES.INTERNAL_SERVER_ERROR);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Database query failed");
      assert.equal(res.body.error, "ApplicationError");
      assert.ok(res.body.timestamp);
    });

    it("should support custom status code, error type, and field errors", () => {
      const res = createMockResponse();
      const fieldErrors = [
        { field: "email", message: "Email is required" },
        { field: "password", message: "Password is too short" },
      ];

      ApiResponse.error(
        res,
        "Validation failed",
        STATUS_CODES.BAD_REQUEST,
        "ValidationError",
        fieldErrors
      );

      assert.equal(res.statusCode, STATUS_CODES.BAD_REQUEST);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Validation failed");
      assert.equal(res.body.error, "ValidationError");
      assert.deepEqual(res.body.errors, fieldErrors);
    });
  });

  describe("Builder Helpers", () => {
    it("computePagination should safely handle edge cases", () => {
      const meta = ApiResponse.computePagination(0, 1, 10);
      assert.equal(meta.totalPages, 1);
      assert.equal(meta.hasNextPage, false);
      assert.equal(meta.hasPrevPage, false);

      const metaNegative = ApiResponse.computePagination(20, -5, 0);
      assert.equal(metaNegative.page, 1);
      assert.equal(metaNegative.limit, 1);
      assert.equal(metaNegative.totalPages, 20);
    });

    it("buildSuccess and buildError generate pure envelope objects", () => {
      const success = ApiResponse.buildSuccess({ ping: "pong" }, "Healthy");
      assert.equal(success.success, true);
      assert.equal(success.message, "Healthy");
      assert.deepEqual(success.data, { ping: "pong" });

      const error = ApiResponse.buildError("Failed", "AuthError");
      assert.equal(error.success, false);
      assert.equal(error.message, "Failed");
      assert.equal(error.error, "AuthError");
    });
  });
});
