import React, { useState, useEffect } from 'react';
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
  Radio,
  Upload,
  Progress,
  Row,
  Col,
  TableColumnsType,
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  UploadOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import { BlogCategory, IRule } from '../../modules/Category/models';
import { useGetBlogCategories } from '../../modules/Category/hooks/useGetAllBlogCategories';
import { useGetAllRules } from '../../modules/Category/hooks/useGetAllRules';
import { useCreateBlogCategory } from '../../modules/Category/hooks/useCreateBlogCategory';
import { useDeleteBlogCategory } from '../../modules/Category/hooks/useDeleteBlogCategory';
import { useCreateRule } from '../../modules/Category/hooks/useCreateRule';
import { useUpdateRule } from '../../modules/Category/hooks/useUpdateRule';
import { useDeleteRule } from '../../modules/Category/hooks/useDeleteRule';
import useCloudinaryUpload from '../../modules/Cloudinary/Macths/hooks/useCloudinaryUpload';

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

  // Image handling state
  const [image1InputType, setImage1InputType] = useState<'url' | 'upload'>(
    'url'
  );
  const [image2InputType, setImage2InputType] = useState<'url' | 'upload'>(
    'url'
  );
  const [image1, setImage1] = useState<string>('');
  const [image2, setImage2] = useState<string>('');
  const { uploadToCloudinary, uploading, progress } = useCloudinaryUpload();

  // Image preview modal
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const { data: categoriesData, refetch: refetchCategories } =
    useGetBlogCategories();
  const { data: rulesData, refetch: refetchRules } = useGetAllRules();

  const { mutate: createCategory } = useCreateBlogCategory();
  const { mutate: deleteCategory } = useDeleteBlogCategory();

  const { mutate: createRule } = useCreateRule();
  const { mutate: updateRule } = useUpdateRule();
  const { mutate: deleteRule } = useDeleteRule();

  // Set initial values when editing a rule
  useEffect(() => {
    if (selectedRule) {
      setRuleContent(selectedRule.content || '');
      setImage1(selectedRule.image1 || '');
      setImage2(selectedRule.image2 || '');
    }
  }, [selectedRule]);

  // Image upload handlers
  const handleImage1Upload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        ruleForm.setFieldsValue({ image1: result.secure_url });
        setImage1(result.secure_url);
        message.success('Image 1 uploaded successfully');
        return false;
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false;
  };

  const handleImage2Upload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        ruleForm.setFieldsValue({ image2: result.secure_url });
        setImage2(result.secure_url);
        message.success('Image 2 uploaded successfully');
        return false;
      }
    } catch (err) {
      message.error('Failed to upload image');
    }
    return false;
  };

  // Reset image states
  const resetImageStates = () => {
    setImage1('');
    setImage2('');
    setImage1InputType('url');
    setImage2InputType('url');
  };

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
    const ruleValues = {
      ...values,
      content: ruleContent,
      image1: values.image1 || '',
      image2: values.image2 || '',
    };

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
            resetImageStates();
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
          resetImageStates();
          refetchRules();
        },
        onError: () => {
          message.error('Failed to create rule');
        },
      });
    }
  };

  // Preview image helper function
  const handleViewImage = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setIsImageModalVisible(true);
  };

  // Define table columns
  const categoryColumns: TableColumnsType<BlogCategory> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCategory(record);
              setIsCategoryModalVisible(true);
              categoryForm.setFieldsValue(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
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
          />
        </Space>
      ),
    },
  ];

  const ruleColumns: TableColumnsType<IRule> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'blogCategoryId',
      key: 'blogCategoryId',
      width: 120,
      render: (blogCategoryId) => {
        const category = categoriesData?.results?.find(
          (cat: BlogCategory) => cat.id === blogCategoryId
        );
        return category ? category.name : 'Unknown';
      },
    },
    {
      title: 'Images',
      key: 'images',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.image1 && (
            <img
              src={record.image1}
              alt="Image 1"
              style={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                cursor: 'pointer',
              }}
              onClick={() => handleViewImage(record.image1)}
            />
          )}
          {record.image2 && (
            <img
              src={record.image2}
              alt="Image 2"
              style={{
                width: 50,
                height: 50,
                objectFit: 'cover',
                cursor: 'pointer',
              }}
              onClick={() => handleViewImage(record.image2)}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'Content Preview',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedRule(record);
              setRuleContent(record.content || '');
              setImage1(record.image1 || '');
              setImage2(record.image2 || '');
              ruleForm.setFieldsValue(record);
              setIsRuleModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
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
          />
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
            pagination={false}
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
              resetImageStates();
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
            pagination={false}
          />
        </TabPane>
      </Tabs>

      {/* Category Modal */}
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

      {/* Rule Modal with image fields */}
      <Modal
        title={selectedRule ? 'Edit Rule' : 'Add Rule'}
        open={isRuleModalVisible}
        width={800}
        onCancel={() => {
          setIsRuleModalVisible(false);
          setSelectedRule(null);
          setRuleContent('');
          ruleForm.resetFields();
          resetImageStates();
        }}
        footer={null}
      >
        <Form
          form={ruleForm}
          layout="vertical"
          initialValues={
            selectedRule || {
              title: '',
              content: '',
              blogCategoryId: null,
              image1: '',
              image2: '',
            }
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

          {/* Image 1 Input Section */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Image 1 Source">
                <Radio.Group
                  value={image1InputType}
                  onChange={(e) => setImage1InputType(e.target.value)}
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="url">
                    <LinkOutlined /> URL
                  </Radio.Button>
                  <Radio.Button value="upload">
                    <UploadOutlined /> Upload
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {image1InputType === 'url' ? (
                <Form.Item
                  name="image1"
                  label="Image 1 URL"
                  rules={[{ required: false }]}
                >
                  <Input
                    placeholder="https://example.com/image1.jpg"
                    onChange={(e) => setImage1(e.target.value)}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="image1"
                  label="Upload Image 1"
                  rules={[{ required: false }]}
                >
                  <div>
                    <Upload.Dragger
                      name="file"
                      multiple={false}
                      showUploadList={false}
                      beforeUpload={handleImage1Upload}
                      accept="image/*"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag image to upload
                      </p>
                    </Upload.Dragger>
                    {uploading && (
                      <Progress
                        percent={progress}
                        size="small"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                </Form.Item>
              )}

              {image1 && (
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <img
                    src={image1}
                    alt="Preview 1"
                    style={{ maxWidth: '100%', maxHeight: 150 }}
                  />
                </div>
              )}
            </Col>

            {/* Image 2 Input Section */}
            <Col span={12}>
              <Form.Item label="Image 2 Source">
                <Radio.Group
                  value={image2InputType}
                  onChange={(e) => setImage2InputType(e.target.value)}
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="url">
                    <LinkOutlined /> URL
                  </Radio.Button>
                  <Radio.Button value="upload">
                    <UploadOutlined /> Upload
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {image2InputType === 'url' ? (
                <Form.Item
                  name="image2"
                  label="Image 2 URL"
                  rules={[{ required: false }]}
                >
                  <Input
                    placeholder="https://example.com/image2.jpg"
                    onChange={(e) => setImage2(e.target.value)}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="image2"
                  label="Upload Image 2"
                  rules={[{ required: false }]}
                >
                  <div>
                    <Upload.Dragger
                      name="file"
                      multiple={false}
                      showUploadList={false}
                      beforeUpload={handleImage2Upload}
                      accept="image/*"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag image to upload
                      </p>
                    </Upload.Dragger>
                    {uploading && (
                      <Progress
                        percent={progress}
                        size="small"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                </Form.Item>
              )}

              {image2 && (
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <img
                    src={image2}
                    alt="Preview 2"
                    style={{ maxWidth: '100%', maxHeight: 150 }}
                  />
                </div>
              )}
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={uploading}>
              {selectedRule ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title="Image Preview"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={previewImageUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '600px' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ListBlog;
