import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private db: DatabaseService,
    private cloudinary: CloudinaryService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const findProduct = await this.db.product.count({
      where: { name: createProductDto.name },
    });
    if (findProduct) return new BadRequestException();
    const newProduct = await this.db.product.create({
      data: {
        destination: createProductDto.destination,
        dosage: createProductDto.dosage,
        handle: createProductDto.name.replaceAll(' ', '-'),
        howPack: createProductDto.howPack,
        ingredient: createProductDto.ingredient,
        name: createProductDto.name,
        price: createProductDto.price,
        stored: createProductDto.stored,
        typeUse: createProductDto.typeUse,
        unit: createProductDto.unit,
        typeProduct: { connect: { id: createProductDto.typeProductId } },
      },
      include: { typeProduct: true },
    });
    if (!newProduct) return new BadRequestException();
    return {
      ...newProduct,
      price: {
        value: newProduct.price,
        currencyCode: 'VND',
      },
      availableForSale: true,
      updatedAt: Date.now(),
      images: [
        {
          url: '',
          altText: '',
          width: 382,
          height: 226,
        },
      ],
    };
  }
  async findAll(typeId?: number) {
    const res = await this.db.product.findMany({
      include: { typeProduct: true, mediaList: true },
    });
    const result = res
      .filter((item) => {
        if (typeId) return item.typeProductId == typeId;
        else return item;
      })
      .map((item) => {
        return {
          id: item.id,
          name: item.name,
          handle: item.handle,
          unit: item.unit,
          availableForSale: item.stored > 0 ? true : false,
          price: {
            value: item.price,
            currencyCode: 'VND',
          },
          images: item.mediaList,
          updatedAt: item.updateAt,

          ingredient: item.ingredient, // Thành phần của thuốc

          howPack: item.howPack, // Quy cách
          typeUse: item.typeUse, // Đường dùng

          stored: item.stored, //kho

          dosage: item.dosage,
          destination: item.destination,
          typeProduct: item.typeProduct,
        };
      });
    return result;
  }

  async findOne(id: number) {
    return await this.db.product.findUnique({ where: { id } });
  }
  async findByHandle(handle: string) {
    let res = await this.db.product.findFirst({
      where: { handle },
      include: { typeProduct: true, mediaList: true },
    });
    if (!res) {
      const convert = handle.replaceAll('-', ' ');
      res = await this.db.product.findFirst({
        where: { name: convert },
        include: { typeProduct: true, mediaList: true },
      });
      if (!res) return new BadRequestException();
    }
    const result = {
      ...res,
      availableForSale: res.stored > 0 ? true : false,
      price: {
        value: res.price,
        currencyCode: 'VND',
      },
      images: res.mediaList,
      updatedAt: res.updateAt,
    };
    return result;
  }
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.db.product.findFirst({
      where: { id },
    });
    if (!product) return new BadRequestException();
    const res = await this.db.product.update({
      where: { id },
      data: updateProductDto,
      include: { mediaList: true, typeProduct: true },
    });
    return {
      ...res,
      availableForSale: res.stored > 0 ? true : false,
      price: {
        value: res.price,
        currencyCode: 'VND',
      },
      images: res.mediaList,
      updatedAt: res.updateAt,
    };
  }
  async updateImg(id: number, file: Express.Multer.File) {
    const responseCld = await this.cloudinary.uploadImage(file);
    const product = await this.db.product.findUnique({ where: { id } });
    const updateProductImg = await this.db.product.update({
      where: { id },
      data: {
        mediaList: {
          create: {
            url: responseCld.public_id,
            altText: product.name + responseCld.name,
            type: responseCld.resource_type,
            height: 200,
            width: 200,
          },
        },
      },
    });
    return { message: 'Cập nhật hình ảnh thành công', data: updateProductImg };
  }
  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
