import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BlogService {
  constructor(
    private db: DatabaseService,
    private cloudinary: CloudinaryService,
  ) {}
  async create(createBlogDto: CreateBlogDto, file: Express.Multer.File) {
    const responseCld = await this.cloudinary.uploadImage(file);
    const newBlog = await this.db.blog.create({
      data: {
        title: createBlogDto.title,
        content: createBlogDto.content,
        state: 'Chưa duyệt',
        image: {
          create: {
            url: responseCld.public_id,
            altText: createBlogDto.title + ' Minh Hoạ 1',
            height: responseCld.height,
            width: responseCld.width,
          },
        },
      },
    });

    return newBlog;
  }

  findAll() {
    return this.db.blog.findMany({ include: { image: true } });
  }
  findPublic() {
    return this.db.blog.findMany({
      where: { state: 'Công khai' },
      include: {
        image: true,
      },
    });
  }
  findOne(id: number) {
    return this.db.blog.findFirst({ where: { id } });
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    let res: string;
    if (updateBlogDto.type == 'public') {
      this.db.blog
        .update({
          where: { id },
          data: {
            state: 'Công khai',
          },
        })
        .then(() => {
          res = 'Cập nhật thành công';
        });
    } else res = 'Chưa cập nhật được.';
    return {
      message: res,
    };
  }

  async remove(id: number) {
    await this.db.img.deleteMany({ where: { blogId: id } });
    return await this.db.blog.delete({ where: { id } });
  }
}
