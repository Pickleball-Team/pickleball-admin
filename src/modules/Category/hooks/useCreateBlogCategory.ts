import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { message } from 'antd';
import { BlogCategory } from '../models';

interface CreateBlogCategoryPayload {
  name: string;
}

interface CreateBlogCategoryResponse {
  data: BlogCategory;
  message: string;
}

const createBlogCategory = async (
  newCategory: CreateBlogCategoryPayload
): Promise<CreateBlogCategoryResponse> => {
  try {
    const response = await api.post('/blog-categories/create', newCategory);
    return response.data as CreateBlogCategoryResponse;
  } catch (error) {
    throw new Error('Error creating blog category');
  }
};

export function useCreateBlogCategory() {
  return useMutation<
    CreateBlogCategoryResponse,
    Error,
    CreateBlogCategoryPayload
  >({
    mutationFn: createBlogCategory,
    onSuccess: (data) => {
      message.success(data.message);
    },
    onError: () => {
      message.error('Failed to create blog category');
    },
  });
}
