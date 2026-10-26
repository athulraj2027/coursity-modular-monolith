export * from "./course.controller";

// Public Discovery Controllers
export * from "./get-public-courses.controller";
export * from "./get-featured-courses.controller";
export * from "./get-trending-courses.controller";
export * from "./get-course-by-slug.controller";

// Teacher Studio Controllers
export * from "./get-teacher-courses.controller";
export * from "./get-teacher-metrics.controller";
export * from "./get-teacher-course-by-id.controller";
export * from "./create-course.controller";
export * from "./update-course.controller";
export * from "./delete-course.controller";

// Teacher Curriculum Controllers
export * from "./create-module.controller";
export * from "./update-module.controller";
export * from "./delete-module.controller";
export * from "./reorder-modules.controller";
export * from "./create-lesson.controller";
export * from "./update-lesson.controller";
export * from "./delete-lesson.controller";
export * from "./reorder-lessons.controller";

// Admin Moderation Controllers
export * from "./admin-get-all-courses.controller";
export * from "./admin-get-course-metrics.controller";
export * from "./admin-get-course-by-id.controller";
export * from "./admin-toggle-featured.controller";
export * from "./admin-toggle-trending.controller";
export * from "./admin-delist-course.controller";
export * from "./admin-freeze-course.controller";
export * from "./admin-unfreeze-course.controller";
export * from "./admin-soft-delete-course.controller";
export * from "./admin-restore-course.controller";
export * from "./admin-hard-delete-course.controller";
