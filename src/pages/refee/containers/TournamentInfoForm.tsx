import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Radio,
  Switch,
  Upload,
  Progress,
  Space,
  Typography,
  Divider,
  Card,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  LinkOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { TournamentType } from '../../../modules/Tournaments/models';
import { useUpdateTournament } from '../../../modules/Tournaments/hooks/useUpdateTournamen';
import useCloudinaryUpload from '../../../modules/Cloudinary/Macths/hooks/useCloudinaryUpload';

const { Option } = Select;
const { Text } = Typography;

type TournamentInfoFormProps = {
  data: any;
  onSave: (values: any) => void;
};

const TournamentInfoForm = ({ data, onSave }: TournamentInfoFormProps) => {
  const [form] = Form.useForm();
  const { mutate: updateTournament } = useUpdateTournament();
  const [isFree, setIsFree] = useState<boolean>(data?.isFree || false);

  // Banner upload states
  const [bannerInputType, setBannerInputType] = useState<'url' | 'upload'>(
    'url'
  );
  const [previewBanner, setPreviewBanner] = useState<string>('');
  const { uploadToCloudinary, uploading, progress } = useCloudinaryUpload();

  // Watch for banner URL changes
  const bannerUrl = Form.useWatch('banner', form);

  // Check if tournament is editable - only status can be changed if not editable
  const isEdit = data.status === 'Scheduled' || data.status === 'Pending';
  const isFieldDisabled = !isEdit;

  // Update preview when banner URL changes
  useEffect(() => {
    if (bannerUrl) {
      setPreviewBanner(bannerUrl);
    }
  }, [bannerUrl]);

  // Set initial preview
  useEffect(() => {
    if (data?.banner) {
      setPreviewBanner(data.banner);
    }
    
    // Initialize isFree state
    setIsFree(data?.isFree || false);
  }, [data?.banner, data?.isFree]);

  // Handle form values when isFree changes
  useEffect(() => {
    const currentIsFree = form.getFieldValue('isFree');
    if (currentIsFree) {
      form.setFieldsValue({ entryFee: 0 });
    } else {
      // If it's not free and the current entry fee is 0, set a default
      const currentEntryFee = form.getFieldValue('entryFee');
      if (currentEntryFee === 0) {
        form.setFieldsValue({ entryFee: 10000 });
      }
    }
  }, [form.getFieldValue('isFree')]);

  const handleFinish = (values: any) => {
    const updatedValues = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
      // Ensure isFree and entryFee are consistent
      entryFee: values.isFree ? 0 : values.entryFee,
      // Ensure rankings are valid
      isMinRanking: Math.max(1, Math.min(9, values.isMinRanking)),
      isMaxRanking: Math.max(values.isMinRanking, Math.min(9, values.isMaxRanking)),
    };

    // Filter out unchanged fields
    const fieldsToUpdate = Object.keys(updatedValues).reduce((acc, key) => {
      if (updatedValues[key] !== data[key]) {
        acc[key] = updatedValues[key];
      }
      return acc;
    }, {} as any);

    updateTournament(
      { id: data.id, data: fieldsToUpdate },
      {
        onSuccess: () => {
          message.success('Tournament updated successfully');
          onSave(updatedValues);
        },
        onError: () => {
          message.error('Failed to update tournament');
        },
      }
    );
  };

  // Handle banner image upload
  const handleBannerUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        form.setFieldsValue({ banner: result.secure_url });
        setPreviewBanner(result.secure_url);
        message.success('Banner uploaded successfully');
        return false; // Prevent default upload behavior
      }
    } catch (err) {
      message.error('Failed to upload banner image');
    }
    return false; // Prevent default upload behavior
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: data?.name,
        location: data?.location,
        maxPlayer: data?.maxPlayer,
        totalPrize: data?.totalPrize,
        status: data?.status,
        startDate: data?.startDate ? moment(data?.startDate) : null,
        endDate: data?.endDate ? moment(data?.endDate) : null,
        banner: data?.banner,
        type: data?.type,
        entryFee: data?.entryFee,
        isFree: data?.isFree,
        social: data?.social,
        isMinRanking: data?.isMinRanking || 1,
        isMaxRanking: data?.isMaxRanking || 9,
      }}
      onFinish={handleFinish}
    >
      {/* Section 2: Tournament Schedule & Status */}
      <Card
        className="section-card"
        title={
          <>
            <CalendarOutlined /> Schedule & Status
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select the status!' }]}
            >
              <Select>
                <Option value="Scheduled">Scheduled</Option>
                <Option value="Ongoing">Ongoing</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Disable">Disable</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[
                { required: true, message: 'Please select the start date!' },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabled={isFieldDisabled}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true, message: 'Please select the end date!' },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabled={isFieldDisabled}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      {/* Section 1: Basic Tournament Information */}
      <Card
        className="section-card"
        title={
          <>
            <InfoCircleOutlined /> Basic Information
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Tournament Name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <Input disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Tournament Type"
              rules={[
                {
                  required: true,
                  message: 'Please select the tournament type!',
                },
              ]}
            >
              <Select disabled={isFieldDisabled}>
                <Option value={0}>Singles</Option>
                <Option value={1}>Doubles</Option>
                <Option value={2}>Mixed</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="location"
              label="Location"
              rules={[
                { required: true, message: 'Please input the location!' },
              ]}
            >
              <Input disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 3: Tournament Details */}
      <Card
        className="section-card"
        title={
          <>
            <TrophyOutlined /> Tournament Details
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="totalPrize"
              label="Total Prize"
              rules={[
                { required: true, message: 'Please input the total prize!' },
              ]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                disabled={true}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => value ? Number(value.replace(/[^\d]/g, '')) : 0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxPlayer"
              label="Max Players"
              rules={[
                { required: true, message: 'Please input the max players!' },
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} disabled={true} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isFree"
              label={
                <span>
                  Free Tournament{' '}
                  <Tooltip title="Toggle between free and paid tournament">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Free"
                unCheckedChildren="Paid"
                disabled={isFieldDisabled}
                onChange={(checked) => {
                  setIsFree(checked);
                  if (checked) {
                    form.setFieldsValue({ entryFee: 0 });
                  } else {
                    // Set default entry fee when switching to paid
                    form.setFieldsValue({ entryFee: 10000 });
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="entryFee"
              label={
                <span>
                  Entry Fee{' '}
                  <Tooltip title={isFree ? "Free tournament, no entry fee" : "Entry fee must be between 10,000 and 1,000,000"}>
                    <DollarOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: 'Please input the entry fee!' },
                {
                  validator: (_, value) => {
                    if (isFree) return Promise.resolve();
                    if (value >= 10000 && value <= 1000000) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Entry fee must be between 10,000 and 1,000,000')
                    );
                  },
                },
              ]}
            >
              <InputNumber 
                min={isFree ? 0 : 10000} 
                max={isFree ? 0 : 1000000} 
                style={{ width: '100%' }} 
                disabled={isFree || isFieldDisabled}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => value ? Number(value.replace(/[^\d]/g, '')) : (isFree ? 0 : 10000)}
                addonAfter="VND"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 4: Player Requirements */}
      <Card
        className="section-card"
        title={
          <>
            <TeamOutlined /> Player Requirements
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isMinRanking"
              label={
                <span>
                  Minimum Ranking{' '}
                  <Tooltip title="Minimum ranking must be between 1 and 9">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please input the minimum ranking!',
                },
                { type: 'number', min: 1, max: 9, message: 'Ranking must be between 1 and 9' }
              ]}
            >
              <InputNumber
                min={1}
                max={9}
                style={{ width: '100%' }}
                disabled={isFieldDisabled}
                precision={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isMaxRanking"
              label={
                <span>
                  Maximum Ranking{' '}
                  <Tooltip title="Maximum ranking must be between 1 and 9 and greater than or equal to minimum ranking">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please input the maximum ranking!',
                },
                { type: 'number', min: 1, max: 9, message: 'Ranking must be between 1 and 9' },
                {
                  validator: (_, value) => {
                    const minRanking = form.getFieldValue('isMinRanking');
                    if (value < 1 || value > 9) {
                      return Promise.reject(
                        new Error('Maximum ranking must be between 1 and 9')
                      );
                    }
                    if (value < minRanking) {
                      return Promise.reject(
                        new Error('Maximum ranking must be greater than or equal to minimum ranking')
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                max={9}
                style={{ width: '100%' }}
                disabled={isFieldDisabled}
                precision={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 5: Media & Social */}
      <Card
        className="section-card"
        title={
          <>
            <ShareAltOutlined /> Media & Social
          </>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="social" label="Social Media Link">
              <Input
                placeholder="https://example.com/social"
                disabled={isFieldDisabled}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Banner with upload option */}
        <Form.Item label="Banner Image">
          <Radio.Group
            value={bannerInputType}
            onChange={(e) => setBannerInputType(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="url" disabled={isFieldDisabled}>
              <LinkOutlined /> URL
            </Radio.Button>
            <Radio.Button value="upload" disabled={isFieldDisabled}>
              <UploadOutlined /> Upload
            </Radio.Button>
          </Radio.Group>

          {bannerInputType === 'url' ? (
            <Form.Item
              name="banner"
              noStyle
              rules={[
                { required: true, message: 'Please input the banner URL!' },
              ]}
            >
              <Input
                placeholder="https://example.com/banner.jpg"
                disabled={isFieldDisabled}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="banner"
              noStyle
              rules={[
                { required: true, message: 'Please upload a banner image!' },
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload.Dragger
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleBannerUpload}
                  accept="image/*"
                  disabled={isFieldDisabled}
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
              </Space>
            </Form.Item>
          )}
        </Form.Item>

        {/* Banner Preview */}
        {previewBanner && (
          <div style={{ marginBottom: 16 }}>
            <p>Banner Preview:</p>
            <img
              src={previewBanner}
              alt="Banner Preview"
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
            />
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          style={{ width: '100%' }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Save Tournament'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default React.memo(TournamentInfoForm);
