export { authService } from './authService';
export { coursesService } from './coursesService';
export { categoriesService } from './categoriesService';
export { ordersService, paymentsService } from './ordersService';
export { videosService } from './videosService';
export { usersService } from './usersService';

export type { LoginDto, RegisterDto, AuthResponse } from './authService';
export type { Course, Lesson, CoursesParams } from './coursesService';
export type { Category } from './categoriesService';
export type { Order, OrderItem } from './ordersService';
export type { StreamResponse, VideoProgress } from './videosService';
export type { UserProfile, UserCourse, UpdateProfileDto } from './usersService';
