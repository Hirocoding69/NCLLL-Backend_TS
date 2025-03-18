import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Types } from 'mongoose';

/**
 * Custom decorator for validating MongoDB ObjectId strings
 */
export function IsMongoId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMongoId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return Types.ObjectId.isValid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId`;
        }
      }
    });
  };
}