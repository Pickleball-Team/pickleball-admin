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
} from 'antd';
import { UploadOutlined, LinkOutlined, CalendarOutlined, TrophyOutlined, TeamOutlined, ShareAltOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
  
  // Banner upload states
  const [bannerInputType, setBannerInputType] = useState<'url' | 'upload'>('url');
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
  }, [data?.banner]);

  // Handle form values when isFree changes
  useEffect(() => {
    const isFree = form.getFieldValue('isFree');
    if (isFree) {
      form.setFieldsValue({ entryFee: 0 });
    }
  }, [form.getFieldValue('isFree')]);

  const handleFinish = (values: any) => {
    const updatedValues = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
      // Ensure isFree and entryFee are consistent
      entryFee: values.isFree ? 0 : values.entryFee,
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
        isMinRanking: data?.isMinRanking,
        isMaxRanking: data?.isMaxRanking
      }}
      onFinish={handleFinish}
    >

            {/* Section 2: Tournament Schedule & Status */}
            <Card 
        className="section-card" 
        title={<><CalendarOutlined /> Schedule & Status</>}
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
              rules={[{ required: true, message: 'Please select the start date!' }]}
            >
              <DatePicker style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select the end date!' }]}
            >
              <DatePicker style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      {/* Section 1: Basic Tournament Information */}
      <Card 
        className="section-card" 
        title={<><InfoCircleOutlined /> Basic Information</>}
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
              rules={[{ required: true, message: 'Please select the tournament type!' }]}
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
              rules={[{ required: true, message: 'Please input the location!' }]}
            >
              <Input disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>



      {/* Section 3: Tournament Details */}
      <Card 
        className="section-card" 
        title={<><TrophyOutlined /> Tournament Details</>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="totalPrize"
              label="Total Prize"
              rules={[{ required: true, message: 'Please input the total prize!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxPlayer"
              label="Max Players"
              rules={[{ required: true, message: 'Please input the max players!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="entryFee"
              label="Entry Fee"
              rules={[{ required: true, message: 'Please input the entry fee!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} disabled={Form.useWatch('isFree', form) || isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="isFree"
              label="Free Tournament"
              valuePropName="checked"
            >
              <Switch disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 4: Player Requirements */}
      <Card 
        className="section-card" 
        title={<><TeamOutlined /> Player Requirements</>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isMinRanking"
              label="Minimum Ranking"
              rules={[{ required: true, message: 'Please input the minimum ranking!' }]}
            >
              <InputNumber min={0} max={10} style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isMaxRanking"
              label="Maximum Ranking"
              rules={[{ required: true, message: 'Please input the maximum ranking!' }]}
            >
              <InputNumber min={0} max={10} style={{ width: '100%' }} disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 5: Media & Social */}
      <Card 
        className="section-card" 
        title={<><ShareAltOutlined /> Media & Social</>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="social"
              label="Social Media Link"
            >
              <Input placeholder="https://example.com/social" disabled={isFieldDisabled} />
            </Form.Item>
          </Col>
        </Row>
        
        {/* Banner with upload option */}
        <Form.Item label="Banner Image">
          <Radio.Group 
            value={bannerInputType} 
            onChange={e => setBannerInputType(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <Radio.Button value="url" disabled={isFieldDisabled}><LinkOutlined /> URL</Radio.Button>
            <Radio.Button value="upload" disabled={isFieldDisabled}><UploadOutlined /> Upload</Radio.Button>
          </Radio.Group>
          
          {bannerInputType === 'url' ? (
            <Form.Item
              name="banner"
              noStyle
              rules={[{ required: true, message: 'Please input the banner URL!' }]}
            >
              <Input placeholder="https://example.com/banner.jpg" disabled={isFieldDisabled} />
            </Form.Item>
          ) : (
            <Form.Item
              name="banner"
              noStyle
              rules={[{ required: true, message: 'Please upload a banner image!' }]}
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
                  <p className="ant-upload-text">Click or drag image to upload</p>
                </Upload.Dragger>
                {uploading && <Progress percent={progress} size="small" style={{ marginTop: 8 }} />}
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
