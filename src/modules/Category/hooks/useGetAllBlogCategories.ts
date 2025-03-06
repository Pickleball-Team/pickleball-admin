import { useQuery } from '@tanstack/react-query';
import api from '../../../configs/api/api';
import { BlogCategoryResponse } from '../models';
import { GET_BLOG_CATEGORIES } from '../constants';

const fetchBlogCategories = async (): Promise<BlogCategoryResponse> => {
  try {
    const response = await api.get('/blog-categories');
    return response.data as BlogCategoryResponse;
  } catch (error) {
    throw new Error('Error fetching blog categories');
  }
};

export function useGetBlogCategories() {
  return useQuery<BlogCategoryResponse>({
    queryKey: [GET_BLOG_CATEGORIES],
    queryFn: fetchBlogCategories,
    refetchInterval: 3000,
  });
}
