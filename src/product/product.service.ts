import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateImgProductDto } from './dto/update-img.dto';

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
    const type =
      createProductDto.typeProduct == 'medicine' ? 'medicine' : 'herb';
    const newProduct = await this.db.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
        unit: createProductDto.unit,
        sku: createProductDto.sku,
        status: 'inactive',
        type,
      },
    });
    if (!newProduct) return new BadRequestException();
    return {
      ...newProduct,
      price: {
        value: newProduct.price,
        currencyCode: 'VND',
      },
      availableForSale: false,
      updatedAt: newProduct.updateAt,
    };
  }
  async findAll() {
    const res = await this.db.product.findMany({
      include: { mediaList: true },
    });
    return res;
  }
  async findAllItemActive() {
    const res = await this.db.product.findMany({
      where: { status: 'active' },
      include: { mediaList: true },
    });
    const result = res.map((item) => {
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        availableForSale: true,
        price: {
          value: item.price,
          currencyCode: 'VND',
        },
      };
    });
    return result;
  }

  async findOne(id: number) {
    return await this.db.product.findUnique({ where: { id } });
  }
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.db.product.findFirst({
      where: { id },
    });
    if (!product) return new BadRequestException();
    const res = await this.db.product.update({
      where: { id },
      data: updateProductDto,
      include: { mediaList: true },
    });
    return {
      ...res,
      availableForSale: true,
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
    const media = await this.db.media.create({
      data: {
        url: responseCld.public_id,
        altText: responseCld.name,
        type: responseCld.resource_type,
        height: 200,
        width: 200,
      },
    });
    const updateProductImg = await this.db.product.update({
      where: { id },
      data: {
        mediaList: {
          create: {
            mediaId: media.id,
          },
        },
      },
    });
    return { message: 'Cập nhật hình ảnh thành công', data: updateProductImg };
  }
  async updateInfoImg(data: UpdateImgProductDto) {
    const exitsMedia = await this.db.media.findFirst({
      where: { url: data.url },
    });
    if (exitsMedia) return new BadRequestException();
    const media = await this.db.media.create({
      data: {
        url: data.url,
        altText: data.altText,
        type: data.type,
        height: data.height,
        width: data.width,
      },
    });
    const updateProductImg = await this.db.product.update({
      where: { id: data.product_id },
      data: {
        mediaList: {
          create: {
            mediaId: media.id,
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
