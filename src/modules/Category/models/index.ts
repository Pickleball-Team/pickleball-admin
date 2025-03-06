export interface IRule {
  id: number;
  title: string;
  content: string;
  blogCategoryId: number;
}

export interface BlogCategory {
  id: number;
  name: string;
}

export interface BlogCategoryResponse {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  results: BlogCategory[];
}

export interface CreateBlogCategoryPayload {
  name: string;
}

export interface CreateBlogCategoryResponse {
  data: BlogCategory;
  message: string;
}

export interface CreateRulePayload {
  title: string;
  content: string;
  blogCategoryId: number;
}

export interface CreateRuleResponse {
  data: IRule;
  message: string;
}

export interface UpdateRulePayload {
  id: number;
  title: string;
  content: string;
}

export interface UpdateRuleResponse {
  data: IRule;
  message: string;
}

export interface DeleteRulePayload {
  RuleId: number;
}

export interface DeleteRuleResponse {
  message: string;
}

export interface IPaginatedResponse<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  results: T[];
}

export type RulesResponse = IPaginatedResponse<IRule>;

export interface DeleteBlogCategoryPayload {
  blogCategoryId: number;
}

export interface DeleteBlogCategoryResponse {
  message: string;
}
