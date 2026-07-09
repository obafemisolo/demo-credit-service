export class ApiResponse {
  static success<T>(message: string, data?: T) {
    return {
      success: true,
      message,
      data,
    };
  }

  static created<T>(message: string, data?: T) {
    return {
      success: true,
      message,
      data,
    };
  }
}
