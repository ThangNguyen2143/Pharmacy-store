import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BlogService {
  constructor(private db: DatabaseService) {}
  async create(createBlogDto: CreateBlogDto) {
    // const responseCld = await this.cloudinary.uploadImage(file);
    if (!createBlogDto.images || createBlogDto.images.length === 0) {
      createBlogDto.images.forEach(async (url, i) => {
        await this.db.media.create({
          data: {
            url,
            altText: createBlogDto.title + ' Minh Hoạ ' + (i + 1),
            height: 0,
            width: 0,
            type: 'img',
          },
        });
      });
    }
    const newBlog = await this.db.blog.create({
      data: {
        title: createBlogDto.title,
        content: createBlogDto.content,
        state: 'Chưa duyệt',
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
