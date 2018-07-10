import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Form,
  Input,
  Button,
  Modal,
  message,
  Select,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const Option = Select.Option;
const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="Add List"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="ID">
        {form.getFieldDecorator('ID', {
          rules: [{ required: true, message: 'Please input ID...' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="calltimes">
        {form.getFieldDecorator('calltimes', {
          rules: [{ required: true, message: 'Please input calltimes...' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="desc">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Please input desc...' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="flag">
        {form.getFieldDecorator('flag',{ initialValue: '1'})(<Select>
          <Option value="1">1</Option>
          <Option value="2">2</Option>
          <Option value="3">3</Option>
        </Select>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="status">
        {form.getFieldDecorator('status', { initialValue: 'closed'})
        (<Select>
          <Option value="closed">closed</Option>
          <Option value="open">open</Option>
        </Select>)}
      </FormItem>
    </Modal>
  );
});

@connect(({ list, loading }) => ({
  list,
  loading: loading.models.lsit,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'list/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/add',
      payload: fields,
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const {
      list: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const columns = [
      {
        title: 'ID',
        dataIndex: 'ID',
      },
      {
        title: 'calltimes',
        dataIndex: 'calltimes',
      },
      {
        title: 'desc',
        dataIndex: 'desc',
      },
      {
        title: 'flag',
        dataIndex: 'flag',
      },
      {
        title: 'status',
        dataIndex: 'status',
      },
      {
        title: 'time',
        dataIndex: 'time',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="AWS List">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
