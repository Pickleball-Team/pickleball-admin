import { useMutation } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { message } from 'antd';
import { DeleteBlogCategoryPayload, DeleteBlogCategoryResponse } from '../models';



const deleteBlogCategory = async ({ blogCategoryId }: DeleteBlogCategoryPayload): Promise<DeleteBlogCategoryResponse> => {
  try {
    const response = await api.delete(`/blog-categories/delete?blogCategoryId=${blogCategoryId}`);
    return response.data as DeleteBlogCategoryResponse;
  } catch (error) {
    throw new Error('Error deleting blog category');
  }
};

export function useDeleteBlogCategory() {
  return useMutation<DeleteBlogCategoryResponse, Error, DeleteBlogCategoryPayload>({
    mutationFn: deleteBlogCategory,
    onSuccess: (data) => {
      message.success(data.message);
    },
    onError: () => {
      message.error('Failed to delete blog category');
    },
  });
}
