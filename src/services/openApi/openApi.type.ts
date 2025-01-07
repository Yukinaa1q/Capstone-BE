import { ResponseCode } from '@common/error';
import { PUBLIC_API_KEY } from '@constants';
import { Controller, SetMetadata, Type, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  getSchemaPath,
  OmitType,
} from '@nestjs/swagger';
import { IsArray } from 'class-validator';

type SwaggerDecoratorParams = Parameters<typeof ApiProperty>;
type SwaggerDecoratorMetadata = SwaggerDecoratorParams[0];
type EnumPropertyMetadata = SwaggerDecoratorMetadata &
  PropertyExtensionParameters;

export const EnumPropertyDecorator = (params: EnumPropertyMetadata) => {
  return ApiProperty(params);
};

class PropertyExtensionParameters {
  'x-enumNames'?: string[];
}

export class IResponse<T> {
  @EnumPropertyDecorator({
    description: `Application code`,
    enum: ResponseCode,
    'x-enumNames': Object.keys(ResponseCode).filter((key) =>
      isNaN(Number(key)),
    ),
  })
  code: ResponseCode;

  @ApiProperty({
    description: 'Can be success or error message',
  })
  message: string;

  @ApiProperty({
    description: 'Is API success',
  })
  success: boolean;

  data: T;

  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional()
  timestamp?: Date;
}

export class Pageable<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly result: T[];

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly size: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(
    data: T[],
    { size, page, count }: { size: number; page: number; count: number },
  ) {
    this.result = data;
    this.page = page;
    this.size = size;
    this.itemCount = count;
    this.pageCount = Math.ceil(this.itemCount / this.size);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export const ApiResponseArray = (model: Type) => {
  return applyDecorators(
    ApiExtraModels(IResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
};

export const ApiResponseString = () => {
  return applyDecorators(
    ApiExtraModels(IResponse),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            type: 'object',
            properties: {
              data: {
                type: 'string',
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
};

export const ApiResponseNumber = () => {
  return applyDecorators(
    ApiExtraModels(IResponse, Number),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            type: 'object',
            properties: {
              data: {
                type: 'integer',
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
};

export const ApiResponseBoolean = () => {
  return applyDecorators(
    ApiExtraModels(IResponse, Boolean),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            type: 'object',
            properties: {
              data: {
                type: 'boolean',
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
};

export const ApiResponseObject = (model: Type) => {
  return applyDecorators(
    ApiExtraModels(IResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            type: 'object',
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
};

export const ApiResponsePagination = (model: Type) => {
  return applyDecorators(
    ApiExtraModels(IResponse, Pageable, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(IResponse) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(Pageable),
                properties: {
                  result: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiPublic = () => SetMetadata(PUBLIC_API_KEY, true);

export const ApiController = (prefix: string | string[]) => {
  return applyDecorators(
    ApiTags(typeof prefix === 'string' ? prefix : prefix[0]),
    ApiPublic(),
    Controller(prefix),
  );
};

export const ApiAuthController = (prefix: string | string[]) => {
  return applyDecorators(
    ApiTags(typeof prefix === 'string' ? prefix : prefix[0]),
    ApiBearerAuth(),
    Controller(prefix),
  );
};

export const OmitUpdateType = (type: Type, properties: string[]) =>
  OmitType(type, [
    ...properties,
    'createdTime',
    'updatedTime',
    'lastUpdateDataTime',
  ] as const);

export const OmitResponseType = (type: Type, properties: string[]) =>
  OmitType(type, [...properties] as const);
