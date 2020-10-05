// tslint:disable:max-classes-per-file
export class AppError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TargetDoesNotExistError extends AppError {
  constructor(target: string) {
    super(`${target} does not exist`);
  }
}
