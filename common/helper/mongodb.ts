import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ObjectId } from 'mongodb';

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export function IsObjectId(validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'IsObjectId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && isValidObjectId(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId`;
        },
      },
    });
  };
}
