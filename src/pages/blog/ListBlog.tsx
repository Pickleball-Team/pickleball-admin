import React, { useState, useEffect, useMemo } from 'react';
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
  Card,
  Tooltip,
  Tag,
  Typography,
  Badge,
  Avatar,
  Divider,
  Empty,
  Spin,
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  UploadOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  FilterOutlined,
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
const { Title, Text, Paragraph } = Typography;

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
  const [activeTopTab, setActiveTopTab] = useState<string>('1');
  const [activeRuleCategory, setActiveRuleCategory] = useState<string | number>('all');

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

  const { data: categoriesData, refetch: refetchCategories, isLoading: loadingCategories } =
    useGetBlogCategories();
  const { data: rulesData, refetch: refetchRules, isLoading: loadingRules } = useGetAllRules();

  const { mutate: createCategory } = useCreateBlogCategory();
  const { mutate: deleteCategory } = useDeleteBlogCategory();

  const { mutate: createRule } = useCreateRule();
  const { mutate: updateRule } = useUpdateRule();
  const { mutate: deleteRule } = useDeleteRule();

  // Organize rules by category
  const rulesByCategory = useMemo(() => {
    const categories = categoriesData?.results || [];
    const rules = rulesData?.results || [];
    
    const ruleMap = new Map();
    
    // Initialize with all categories (even those without rules)
    categories.forEach(category => {
      ruleMap.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        rules: []
      });
    });
    
    // Add rules to their respective categories
    rules.forEach(rule => {
      const categoryId = rule.blogCategoryId;
      if (ruleMap.has(categoryId)) {
        const category = ruleMap.get(categoryId);
        category.rules.push(rule);
      } else {
        // Handle orphaned rules (those with category IDs not in the categories list)
        ruleMap.set(categoryId, {
          categoryId: categoryId,
          categoryName: 'Unknown Category',
          rules: [rule]
        });
      }
    });
    
    return Array.from(ruleMap.values());
  }, [categoriesData, rulesData]);

  // Filter rules based on active category tab
  const filteredRules = useMemo(() => {
    if (activeRuleCategory === 'all') {
      return rulesData?.results || [];
    } else {
      return (rulesData?.results || []).filter(rule => rule.blogCategoryId === activeRuleCategory);
    }
  }, [rulesData, activeRuleCategory]);

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
          <Tooltip title="Edit Category">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedCategory(record);
                setIsCategoryModalVisible(true);
                categoryForm.setFieldsValue(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Category">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Category',
                  content: 'Are you sure you want to delete this category? This will affect all associated content.',
                  okText: 'Yes',
                  okType: 'danger',
                  cancelText: 'No',
                  onOk() {
                    deleteCategory(
                      { blogCategoryId: record.id },
                      {
                        onSuccess: () => {
                          message.success('Category deleted successfully');
                          refetchCategories();
                          refetchRules();
                        },
                        onError: () => {
                          message.error('Failed to delete category');
                        },
                      }
                    );
                  }
                });
              }}
            />
          </Tooltip>
          <Tooltip title="View Content">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setActiveTopTab('2');
                setActiveRuleCategory(record.id);
              }}
            />
          </Tooltip>
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
      render: (title) => (
        <Tooltip title={title}>
          <span className="rule-title">
            {title?.length > 40 ? `${title.substring(0, 40)}...` : title}
          </span>
        </Tooltip>
      ),
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
        return category ? (
          <Tag color="blue">{category.name}</Tag>
        ) : (
          <Tag color="red">Unknown</Tag>
        );
      },
    },
    {
      title: 'Images',
      key: 'images',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.image1 && (
            <Avatar
              src={record.image1}
              alt="Image 1"
              shape="square"
              size="large"
              style={{ cursor: 'pointer' }}
              onClick={() => handleViewImage(record.image1)}
            />
          )}
          {record.image2 && (
            <Avatar
              src={record.image2}
              alt="Image 2"
              shape="square"
              size="large"
              style={{ cursor: 'pointer' }}
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
      render: (content) => {
        // Strip HTML tags for preview
        const strippedContent = content?.replace(/<[^>]+>/g, '') || '';
        return (
          <Tooltip title="Click to view full content">
            <div 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setPreviewImageUrl('');
                setIsImageModalVisible(true);
                setPreviewContent(content);
              }}
            >
              {strippedContent?.length > 100 
                ? `${strippedContent.substring(0, 100)}...` 
                : strippedContent}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Rule">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedRule(record);
                setRuleContent(record.content || '');
                setImage1(record.image1 || '');
                setImage2(record.image2 || '');
                ruleForm.setFieldsValue(record);
                setIsRuleModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Rule">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Rule',
                  content: 'Are you sure you want to delete this rule?',
                  okText: 'Yes',
                  okType: 'danger',
                  cancelText: 'No',
                  onOk() {
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
                  }
                });
              }}
            />
          </Tooltip>
          <Tooltip title="View Content">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setPreviewImageUrl('');
                setIsImageModalVisible(true);
                setPreviewContent(record.content);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Content preview state
  const [previewContent, setPreviewContent] = useState<string>('');

  return (
    <div className="blog-admin-container">
      {/* Hero Header */}
      <Card 
        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', color: 'white' }}
        bodyStyle={{ padding: '24px' }}
        bordered={false}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>Content Management</Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Space>
              {activeTopTab === '1' ? (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setIsCategoryModalVisible(true);
                    categoryForm.resetFields();
                    setSelectedCategory(null);
                  }}
                  style={{ background: 'white', color: '#1890ff' }}
                >
                  Add Category
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsRuleModalVisible(true);
                    ruleForm.resetFields();
                    setSelectedRule(null);
                    setRuleContent('');
                    resetImageStates();
                  }}
                  style={{ background: 'white', color: '#1890ff' }}
                >
                  Add Content
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs 
        activeKey={activeTopTab} 
        onChange={setActiveTopTab}
        type="card"
        className="blog-admin-tabs"
      >
        <TabPane 
          tab={
            <span>
              <FolderOutlined /> Categories
              {/* {categoriesData?.results?.length > 0 && (
                <Badge count={categoriesData?.results.length} style={{ marginLeft: 8 }} />
              )} */}
            </span>
          } 
          key="1"
        >
          <Card bordered={false} bodyStyle={{ padding: '0 0 24px 0' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setIsCategoryModalVisible(true);
                    categoryForm.resetFields();
                    setSelectedCategory(null);
                  }}
                >
                  Add Category
                </Button>
                <Button 
                  // icon={<ReloadOutlined />} 
                  onClick={() => refetchCategories()}
                >
                  Refresh
                </Button>
              </Space>
            </div>

            {loadingCategories ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <p>Loading categories...</p>
              </div>
            ) : categoriesData?.results ? (
              <Table
                columns={categoryColumns}
                dataSource={categoriesData?.results || []}
                rowKey="id"
                style={{ backgroundColor: '#ffffff' }}
                pagination={{ pageSize: 10, showSizeChanger: true }}
              />
            ) : (
              <Empty 
                description="No categories found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <FileTextOutlined /> Content
            </span>
          } 
          key="2"
        >
      

            {/* Category Tabs for Content */}
            {rulesByCategory.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <Divider orientation="left">
                  <Title level={4} style={{ margin: 0 }}>
                    <AppstoreOutlined /> Content by Category
                  </Title>
                </Divider>
                
                <Tabs 
                  type="card" 
                  className="category-tabs"
                  tabPosition="left"
                  style={{ marginTop: 16 }}
                >
                  {rulesByCategory.map((category) => (
                    <TabPane 
                      tab={
                        <span>
                          {category.categoryName}
                          <Badge 
                            count={category.rules.length} 
                            style={{ 
                              marginLeft: 8, 
                              backgroundColor: category.rules.length ? '#52c41a' : '#d9d9d9' 
                            }} 
                          />
                        </span>
                      } 
                      key={category.categoryId}
                    >
                      <div style={{ padding: '0 16px' }}>
                        <Card
                          title={
                            <Space>
                              <FolderOutlined />
                              <span>{category.categoryName}</span>
                              <Tag color="blue">{category.rules.length} items</Tag>
                            </Space>
                          }
                          extra={
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />}
                              onClick={() => {
                                setIsRuleModalVisible(true);
                                ruleForm.resetFields();
                                ruleForm.setFieldsValue({ blogCategoryId: category.categoryId });
                                setSelectedRule(null);
                                setRuleContent('');
                                resetImageStates();
                              }}
                            >
                              Add Content
                            </Button>
                          }
                          bordered={false}
                        >
                          {category.rules.length > 0 ? (
                            <div className="content-cards">
                              <Row gutter={[16, 16]}>
                                {category.rules.map((rule:IRule)  => (
                                  <Col xs={24} sm={12} xl={8} key={rule.id}>
                                    <Card 
                                      hoverable 
                                      cover={rule.image1 && (
                                        <img
                                          alt={rule.title}
                                          src={rule.image1}
                                          style={{ height: 180, objectFit: 'cover' }}
                                          onClick={() => handleViewImage(rule.image1)}
                                        />
                                      )}
                                      actions={[
                                        <Tooltip title="Edit">
                                          <EditOutlined key="edit" onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRule(rule);
                                            setRuleContent(rule.content || '');
                                            setImage1(rule.image1 || '');
                                            setImage2(rule.image2 || '');
                                            ruleForm.setFieldsValue(rule);
                                            setIsRuleModalVisible(true);
                                          }} />
                                        </Tooltip>,
                                        <Tooltip title="View">
                                          <EyeOutlined key="view" onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImageUrl('');
                                            setIsImageModalVisible(true);
                                            setPreviewContent(rule.content);
                                          }} />
                                        </Tooltip>,
                                        <Tooltip title="Delete">
                                          <DeleteOutlined key="delete" onClick={(e) => {
                                            e.stopPropagation();
                                            Modal.confirm({
                                              title: 'Delete Rule',
                                              content: 'Are you sure you want to delete this rule?',
                                              okText: 'Yes',
                                              okType: 'danger',
                                              cancelText: 'No',
                                              onOk() {
                                                deleteRule(
                                                  { RuleId: rule.id },
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
                                              }
                                            });
                                          }} />
                                        </Tooltip>
                                      ]}
                                      onClick={() => {
                                        setPreviewImageUrl('');
                                        setIsImageModalVisible(true);
                                        setPreviewContent(rule.content);
                                      }}
                                    >
                                      <Card.Meta
                                        title={rule.title}
                                        description={(
                                          <div>
                                            <div style={{ maxHeight: '60px', overflow: 'hidden', marginBottom: 8 }}>
                                              {(rule.content?.replace(/<[^>]+>/g, '') || '').substring(0, 100)}
                                              {(rule.content?.replace(/<[^>]+>/g, '') || '').length > 100 ? '...' : ''}
                                            </div>
                                            {rule.image2 && (
                                              <div style={{ marginTop: 8 }}>
                                                <Badge count="2nd image" style={{ backgroundColor: '#52c41a' }} />
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      />
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          ) : (
                            <Empty 
                              description={`No content in ${category.categoryName}`}
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                              <Button 
                                type="primary"
                                onClick={() => {
                                  setIsRuleModalVisible(true);
                                  ruleForm.resetFields();
                                  ruleForm.setFieldsValue({ blogCategoryId: category.categoryId });
                                  setSelectedRule(null);
                                  setRuleContent('');
                                  resetImageStates();
                                }}
                              >
                                Add First Content
                              </Button>
                            </Empty>
                          )}
                        </Card>
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            )}
  
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
        title={selectedRule ? 'Edit Content' : 'Add Content'}
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
            label="Title"
            rules={[
              { required: true, message: 'Please input the title!' },
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
            label="Content"
            rules={[
              { required: true, message: 'Please input the content!' },
            ]}
          >
            <ReactQuill 
              value={ruleContent} 
              onChange={setRuleContent} 
              style={{ height: 200, marginBottom: 50 }}
            />
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
            <Space>
              <Button type="primary" htmlType="submit" disabled={uploading}>
                {selectedRule ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setIsRuleModalVisible(false);
                setSelectedRule(null);
                setRuleContent('');
                ruleForm.resetFields();
                resetImageStates();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image/Content Preview Modal */}
      <Modal
        title="Preview"
        open={isImageModalVisible}
        onCancel={() => {
          setIsImageModalVisible(false);
          setPreviewImageUrl('');
          setPreviewContent('');
        }}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center' }}>
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '600px' }}
            />
          ) : previewContent ? (
            <div className="content-preview-full" dangerouslySetInnerHTML={{ __html: previewContent }} />
          ) : null}
        </div>
      </Modal>

      <style>
        {`
          .blog-admin-container .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
            padding: 12px 16px;
            margin: 0 4px 0 0;
          }
          
          .blog-admin-container .category-tabs .ant-tabs-tab {
            text-align: left;
            padding: 12px 16px;
            margin: 4px 0;
            transition: all 0.3s;
          }
          
          .blog-admin-container .category-tabs .ant-tabs-tab:hover {
            background-color: #f0f0f0;
          }
          
          .blog-admin-container .category-tabs .ant-tabs-tab-active {
            background-color: #e6f7ff;
            border-right: 2px solid #1890ff;
          }
          
          .blog-admin-container .category-tabs .ant-tabs-tab-btn {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .blog-admin-container .category-tabs .ant-tabs-content {
            padding: 0;
            border-left: 1px solid #f0f0f0;
          }
          
          .blog-admin-container .rule-title {
            font-weight: 500;
            color: #1890ff;
          }
          
          .blog-admin-container .content-preview {
            max-height: 300px;
            overflow: auto;
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            background-color: #fafafa;
          }
          
          .blog-admin-container .content-preview-full {
            max-height: 70vh;
            overflow: auto;
            padding: 16px;
            text-align: left;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            background-color: #fafafa;
          }
          
          .blog-admin-container .ant-card-hoverable:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            transform: translateY(-3px);
          }
          
          .blog-admin-container .ant-card-cover img {
            transition: all 0.3s;
          }
          
          .blog-admin-container .ant-card-cover img:hover {
            opacity: 0.9;
          }
          
          .blog-admin-container .content-cards .ant-card-body {
            min-height: 120px;
          }
        `}
      </style>
    </div>
  );
};

export default ListBlog;
