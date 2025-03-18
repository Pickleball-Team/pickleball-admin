import React, { useState } from 'react';
import {
  Button,
  Space,
  Table,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { BlogCategory, IRule } from '../../modules/Category/models';
import { useGetBlogCategories } from '../../modules/Category/hooks/useGetAllBlogCategories';
import { useGetAllRules } from '../../modules/Category/hooks/useGetAllRules';
import { useCreateBlogCategory } from '../../modules/Category/hooks/useCreateBlogCategory';
import { useDeleteBlogCategory } from '../../modules/Category/hooks/useDeleteBlogCategory';
import { useCreateRule } from '../../modules/Category/hooks/useCreateRule';
import { useUpdateRule } from '../../modules/Category/hooks/useUpdateRule';
import { useDeleteRule } from '../../modules/Category/hooks/useDeleteRule';

const { TabPane } = Tabs;
const { Option } = Select;

const ListBlog: React.FC = () => {
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isRuleModalVisible, setIsRuleModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(
    null
  );
  const [selectedRule, setSelectedRule] = useState<IRule | null>(null);
  const [ruleContent, setRuleContent] = useState<string>('');
  const [categoryForm] = Form.useForm();
  const [ruleForm] = Form.useForm();

  const { data: categoriesData, refetch: refetchCategories } =
    useGetBlogCategories();
  const { data: rulesData, refetch: refetchRules } = useGetAllRules();

  const { mutate: createCategory } = useCreateBlogCategory();
  const { mutate: deleteCategory } = useDeleteBlogCategory();

  const { mutate: createRule } = useCreateRule();
  const { mutate: updateRule } = useUpdateRule();
  const { mutate: deleteRule } = useDeleteRule();

  const handleCategorySubmit = (values: any) => {
    if (selectedCategory) {
      // Update category logic here
    } else {
      createCategory(values, {
        onSuccess: () => {
          message.success('Category created successfully');
          setIsCategoryModalVisible(false);
          setSelectedCategory(null);
          categoryForm.resetFields();
          refetchCategories();
        },
        onError: () => {
          message.error('Failed to create category');
        },
      });
    }
  };

  const handleRuleSubmit = (values: any) => {
    const ruleValues = { ...values, content: ruleContent };
    if (selectedRule) {
      updateRule(
        { ...ruleValues, id: selectedRule.id },
        {
          onSuccess: () => {
            message.success('Rule updated successfully');
            setIsRuleModalVisible(false);
            setSelectedRule(null);
            setRuleContent('');
            ruleForm.resetFields();
            refetchRules();
          },
          onError: () => {
            message.error('Failed to update rule');
          },
        }
      );
    } else {
      createRule(ruleValues, {
        onSuccess: () => {
          message.success('Rule created successfully');
          setIsRuleModalVisible(false);
          setRuleContent('');
          ruleForm.resetFields();
          refetchRules();
        },
        onError: () => {
          message.error('Failed to create rule');
        },
      });
    }
  };

  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: BlogCategory) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setSelectedCategory(record);
              setIsCategoryModalVisible(true);
              categoryForm.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              deleteCategory(
                { blogCategoryId: record.id },
                {
                  onSuccess: () => {
                    message.success('Category deleted successfully');
                    refetchCategories();
                  },
                  onError: () => {
                    message.error('Failed to delete category');
                  },
                }
              );
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const ruleColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ whiteSpace: 'pre-wrap' }}
        />
      ),
    },
    {
      title: 'Category',
      dataIndex: 'blogCategoryId',
      key: 'blogCategoryId',
      render: (blogCategoryId: number) => {
        const category = categoriesData?.results.find(
          (cat: BlogCategory) => cat.id === blogCategoryId
        );
        return category ? category.name : 'Unknown';
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: IRule) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setSelectedRule(record);
              setRuleContent(record.content);
              setIsRuleModalVisible(true);
              ruleForm.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              deleteRule(
                { RuleId: record.id },
                {
                  onSuccess: () => {
                    message.success('Rule deleted successfully');
                    refetchRules();
                  },
                  onError: () => {
                    message.error('Failed to delete rule');
                  },
                }
              );
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Category" key="1">
          <Button
            type="primary"
            onClick={() => {
              setIsCategoryModalVisible(true);
              categoryForm.resetFields();
              setSelectedCategory(null);
            }}
            style={{ marginBottom: 16 }}
          >
            Add Category
          </Button>
          <Table
            columns={categoryColumns}
            dataSource={categoriesData?.results || []}
            rowKey="id"
            style={{ backgroundColor: '#ffffff' }}
          />
        </TabPane>
        <TabPane tab="Content (Rule)" key="2">
          <Button
            type="primary"
            onClick={() => {
              setIsRuleModalVisible(true);
              ruleForm.resetFields();
              setSelectedRule(null);
              setRuleContent('');
            }}
            style={{ marginBottom: 16 }}
          >
            Add Rule
          </Button>
          <Table
            columns={ruleColumns}
            dataSource={rulesData?.results || []}
            rowKey="id"
            style={{ backgroundColor: '#ffffff' }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        open={isCategoryModalVisible}
        onCancel={() => {
          setIsCategoryModalVisible(false);
          setSelectedCategory(null);
          categoryForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          initialValues={selectedCategory || { name: '' }}
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please input the category name!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedCategory ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedRule ? 'Edit Rule' : 'Add Rule'}
        open={isRuleModalVisible}
        width={800}
        onCancel={() => {
          setIsRuleModalVisible(false);
          setSelectedRule(null);
          setRuleContent('');
          ruleForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={ruleForm}
          layout="vertical"
          initialValues={
            selectedRule || { title: '', content: '', blogCategoryId: null }
          }
          onFinish={handleRuleSubmit}
        >
          <Form.Item
            name="title"
            label="Rule Title"
            rules={[
              { required: true, message: 'Please input the rule title!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="blogCategoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select>
              {categoriesData?.results?.map((category: BlogCategory) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="Rule Content"
            rules={[
              { required: true, message: 'Please input the rule content!' },
            ]}
          >
            <ReactQuill value={ruleContent} onChange={setRuleContent} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedRule ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListBlog;
