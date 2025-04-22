import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  Upload,
  Progress,
  Divider,
  message,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusCircleOutlined,
  UploadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { TournamentRequest } from '../../../modules/Tournaments/models';
import dayjs from 'dayjs'; // Replace moment with dayjs
import type { Dayjs } from 'dayjs'; // Import Dayjs type
import useCloudinaryUpload from '../../../modules/Cloudinary/Macths/hooks/useCloudinaryUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const sampleTournamentData = {
  name: 'Pickleball Championship ',
  location: 'HCM, Việt Nam',
  maxPlayer: 16,
  description:
    'The Pickleball Online Championship 2025 is open to all, giving players a great chance to showcase their skills and compete in a vibrant sports community',
  banner:
    'https://pickleball360.com.vn/wp-content/uploads/2024/08/banner-pickleball-the-thaoPyRa4.webp',
  note: '',
  isMinRanking: 1,
  isMaxRanking: 9, // Changed from 10 to 9
  social: 'https://facebook.com/example',
  totalPrize: 100000,
  isFree: true,
  entryFee: 10000,
  type: 1, 
};

interface CreateTournamentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: TournamentRequest) => void;
  isSubmitting: boolean;
  organizerId: number;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  isSubmitting,
  organizerId,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>(sampleTournamentData.banner);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const { uploadToCloudinary, uploading, progress } = useCloudinaryUpload();
  const [quillContent, setQuillContent] = useState(sampleTournamentData.note);
  const [isFree, setIsFree] = useState(sampleTournamentData.isFree);

  // Initialize form with default dates when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Set default dates for one week tournament starting tomorrow
      const tomorrow = dayjs().add(1, 'day').startOf('day');
      const nextWeek = tomorrow.add(7, 'day');

      setImageUrl(sampleTournamentData.banner);
      setQuillContent(sampleTournamentData.note);

      form.setFieldsValue({
        startDate: tomorrow,
        endDate: nextWeek,
      });
    }
  }, [visible, form]);

  const handleSubmit = (values: any) => {
    // Ensure all fields have valid values to prevent 404 errors
    const tournamentData: TournamentRequest = {
      name: values.name,
      location: values.location || 'Location not specified',
      maxPlayer: values.maxPlayer,
      description: values.description || 'No description provided',
      banner: values.banner || imageUrl,
      // Keep HTML content intact for rich text display
      note: quillContent || 'No notes provided',
      totalPrize: values.totalPrize || 0,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      type: values.type, // 0 for Singles, 1 for Doubles, 2 for Mixed
      organizerId: organizerId,
      isMinRanking: values.isMinRanking || 1,
      isMaxRanking: values.isMaxRanking || 9, // Changed default from 10 to 9
      social: values.social || 'No social links provided',
      isFree: values.isFree,
      entryFee: values.entryFee,
    };

    // Log the data being sent to help debug
    onSubmit(tournamentData);
  };
  
  const handleUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file);
      if (result && result.secure_url) {
        setImageUrl(result.secure_url);
        form.setFieldsValue({ banner: result.secure_url });
        message.success('Image uploaded successfully');
      }
    } catch (error) {
      message.error('Failed to upload image');
    }
    return false; // Prevent default upload behavior
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    setQuillContent('');
    onCancel();
  };

  // Update the disabledDate function to use dayjs instead of moment
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().startOf('day'));
  };

  const handleEndDateValidation = (_: any, value: Dayjs) => {
    const startDate = form.getFieldValue('startDate');
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(new Error('End date must be after start date'));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircleOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            Create New Tournament
          </Title>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={sampleTournamentData}
        preserve={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tournament Name"
              rules={[
                { required: true, message: 'Please enter tournament name' },
              ]}
            >
              <Input placeholder="Enter tournament name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="Enter tournament location" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                showTime
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true, message: 'Please select end date' },
                { validator: handleEndDateValidation },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                showTime
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="maxPlayer"
              label="Maximum Players"
              rules={[
                { required: true, message: 'Please select maximum players' },
              ]}
              initialValue={16} // Explicitly set default to 16
            >
              <Select
                placeholder="Select maximum players"
                style={{ width: '100%' }}
              >
                <Option value={16}>16</Option>
                <Option value={32}>32</Option>
                <Option value={64}>64</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="totalPrize"
              label={
                <span>
                  Total Prize{' '}
                  <Tooltip title="Enter the total prize money for the tournament">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: 'Please enter total prize' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter prize amount"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value: string | undefined) =>
                  value ? Number(value.replace(/[^\d]/g, '')) : 0
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Tournament Type"
              rules={[
                { required: true, message: 'Please select tournament type' },
              ]}
            >
              <Select placeholder="Select tournament type">
                <Option value={1}>Singles Male</Option>
                <Option value={2}>Singles Female</Option>
                <Option value={3}>Doubles Male</Option>
                <Option value={4}>Doubles Female</Option>
                <Option value={5}>Doubles Mix</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}>
            <Form.Item
              name="isMinRanking"
              label="Minimum Ranking"
              rules={[
              { required: true, message: 'Please enter minimum ranking' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                if (!value || value <= getFieldValue('isMaxRanking')) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                  'Min ranking must be less than or equal to max ranking'
                  )
                );
                },
              }),
              ]}
              initialValue={1} // Set minimum ranking to 1
            >
              <Select style={{ width: '100%' }} placeholder="Select minimum ranking">
              {Array.from({ length: 9 }, (_, i) => i + 1).map(value => (
                <Option key={value} value={value}>
                {value}
                </Option>
              ))}
              </Select>
            </Form.Item>
            </Col>
          <Col span={12}>
            <Form.Item
              name="isMaxRanking"
              label="Maximum Ranking"
              rules={[
              { required: true, message: 'Please enter maximum ranking' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                if (!value || getFieldValue('isMinRanking') <= value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                  'Max ranking must be greater than or equal to min ranking'
                  )
                );
                },
              }),
              ]}
              initialValue={9} // Set maximum ranking to 9
            >
              <Select style={{ width: '100%' }} placeholder="Select maximum ranking">
              {Array.from({ length: 9 }, (_, i) => i + 1).map(value => (
                <Option key={value} value={value}>
                {value}
                </Option>
              ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Banner Image">
          <Select
            value={uploadMethod}
            onChange={setUploadMethod}
            style={{ width: 120, marginBottom: 16 }}
          >
            <Option value="url">URL</Option>
            <Option value="upload">Upload</Option>
          </Select>

          {uploadMethod === 'url' ? (
            <Form.Item
              name="banner"
              noStyle
              rules={[{ required: true, message: 'Please enter banner URL' }]}
            >
              <Input placeholder="Enter banner image URL" />
            </Form.Item>
          ) : (
            <div>
              <Upload.Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                beforeUpload={handleUpload}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to upload</p>
              </Upload.Dragger>
              {uploading && (
                <Progress
                  percent={progress}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}
              {imageUrl && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </div>
              )}
            </div>
          )}
        </Form.Item>

        <Form.Item label="Notes/Rules">
          <ReactQuill
            theme="snow"
            style={{ height: '200px', marginBottom: '50px' }}
            value={quillContent}
            onChange={setQuillContent}
            placeholder="Enter tournament notes or rules"
          />
        </Form.Item>

        <Form.Item
          name="social"
          label="Social Media Links"
          rules={[
            { required: false, message: 'Please enter social media links' },
          ]}
        >
          <TextArea placeholder="Enter social media links" />
        </Form.Item>
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
            checked={!isFree}
            onChange={(checked) => {
              const newIsFree = checked;
              setIsFree(newIsFree);
              form.setFieldsValue({ entryFee: newIsFree ? 0 : 10000 });
              form.validateFields(['entryFee']);
            }}
            checkedChildren="Paid"
            unCheckedChildren="Free"
          />
        </Form.Item>
        {isFree && (
          <Form.Item
            name="entryFee"
            label={
              <span>
                Entry Fee{' '}
                <Tooltip title="Entry fee must be between 10,000 and 1,000,000">
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: 'Please enter entry fee' },
              {
                validator: (_, value) => {
                  if (value >= 10000 && value <= 1000000) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Entry fee must be between 10,000 and 1,000,000')
                  );
                },
              },
            ]}
            initialValue={10000} // Set initial entry fee to 10,000
          >
            <InputNumber
              min={10000}
              max={1000000}
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value: string | undefined) =>
                value ? Number(value.replace(/[^\d]/g, '')) : 10000
              }
              addonAfter="VND"
            />
          </Form.Item>
        )}

        <Divider />

        <Form.Item>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
          >
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={uploading}
            >
              Create Tournament
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTournamentModal;
