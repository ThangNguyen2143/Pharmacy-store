import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductService {
  constructor(private db: DatabaseService) {}
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
        typeProductId: createProductDto.typeProductId,
      },
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
      featuredImage: {
        url: '',
        altText: '',
        width: 382,
        height: 226,
      },
      images: [
        {
          url: '',
          altText: '',
          width: 382,
          height: 226,
        },
      ],
      typeProduct: await this.db.typeproduct.findUnique({
        where: { id: newProduct.typeProductId },
      }),
    };
  }
  // create(dto: CreateProductDto) {
  //   return {
  //     ...dto,
  //     id: 1,
  //     price: {
  //       value: dto.price,
  //       currencyCode: 'VND',
  //     },
  //     availableForSale: true,
  //     updatedAt: Date.now(),
  //     featuredImage: {
  //       url: '',
  //       altText: '',
  //       width: 382,
  //       height: 226,
  //     },
  //     images: [
  //       {
  //         url: '',
  //         altText: '',
  //         width: 382,
  //         height: 226,
  //       },
  //     ],
  //     typeProduct: {
  //       name: '123',
  //       id: dto.typeProductId,
  //       description: '',
  //     },
  //   };
  // }
  async findAll() {
    const typeProduct = await this.db.typeproduct.findMany();
    const imgList = await this.db.media.findMany();
    const res = await this.db.product.findMany();
    const result = res.map((item) => {
      const imgs = imgList.filter((img) => img.productId === item.id);
      return Object.assign(item, {
        typeProduct: typeProduct.find((x) => x.id === item.typeProductId),
        availableForSale: item.stored > 0 ? true : false,
        price: {
          value: item.price,
          currencyCode: 'VND',
        },
        images: [...imgs],
        updatedAt: Date.now(),
      });
    });
    return result;
  }

  async findOne(id: number) {
    return await this.db.product.findUnique({ where: { id } });
  }
  async findByHandle(handle: string) {
    let res = await this.db.product.findFirst({ where: { handle } });
    if (!res) {
      const convert = handle.replaceAll('-', ' ');
      res = await this.db.product.findFirst({ where: { name: convert } });
      if (!res) return new BadRequestException();
    }
    const imgList = await this.db.media.findMany({
      where: { productId: res.id },
    });
    const result = {
      ...res,
      availableForSale: res.stored > 0 ? true : false,
      price: {
        value: res.price,
        currencyCode: 'VND',
      },
      images: [...imgList],
      updatedAt: Date.now(),
      typeProduct: await this.db.typeproduct.findUnique({
        where: { id: res.typeProductId },
      }),
    };
    return result;
  }
  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
