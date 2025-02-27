/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Popconfirm, Select } from 'antd';
import { Authorized, EmptyFiller } from 'app/components';
import { DetailPageHeader } from 'app/components/DetailPageHeader';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { useAccess } from 'app/pages/MainPage/Access';
import debounce from 'debounce-promise';
import { CommonFormTypes, DEFAULT_DEBOUNCE_WAIT } from 'globalConstants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';
import {
  BORDER_RADIUS,
  SPACE_LG,
  SPACE_MD,
  SPACE_TIMES,
} from 'styles/StyleConstants';
import { request } from 'utils/request';
import { errorHandle } from 'utils/utils';
import {
  selectDataProviderConfigTemplateLoading,
  selectDataProviderListLoading,
  selectDataProviders,
  selectOrgId,
} from '../../../slice/selectors';
import { getDataProviderConfigTemplate } from '../../../slice/thunks';
import { QueryResult } from '../../ViewPage/slice/types';
import { useSourceSlice } from '../slice';
import {
  selectDeleteSourceLoading,
  selectEditingSource,
  selectSaveSourceLoading,
  selectUnarchiveSourceLoading,
} from '../slice/selectors';
import {
  addSource,
  deleteSource,
  editSource,
  getSource,
  unarchiveSource,
} from '../slice/thunks';
import { Source, SourceFormModel } from '../slice/types';
import { allowCreateSource, allowManageSource } from '../utils';
import { ConfigComponent } from './ConfigComponent';

export function SourceDetailPage() {
  const [formType, setFormType] = useState(CommonFormTypes.Add);
  const [providerType, setProviderType] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const { actions } = useSourceSlice();
  const dispatch = useDispatch();
  const history = useHistory();
  const orgId = useSelector(selectOrgId);
  const editingSource = useSelector(selectEditingSource);
  const dataProviders = useSelector(selectDataProviders);
  const dataProviderListLoading = useSelector(selectDataProviderListLoading);
  const dataProviderConfigTemplateLoading = useSelector(
    selectDataProviderConfigTemplateLoading,
  );
  const saveSourceLoading = useSelector(selectSaveSourceLoading);
  const unarchiveSourceLoading = useSelector(selectUnarchiveSourceLoading);
  const deleteSourceLoading = useSelector(selectDeleteSourceLoading);
  const { params } = useRouteMatch<{ sourceId: string }>();
  const { sourceId } = params;
  const [form] = Form.useForm<SourceFormModel>();
  const t = useI18NPrefix('source');
  const tg = useI18NPrefix('global');
  const isArchived = editingSource?.status === 0;
  const allowCreate =
    useAccess(allowCreateSource())(true) && sourceId === 'add';
  const allowManage =
    useAccess(allowManageSource(sourceId))(true) && sourceId !== 'add';

  const config = useMemo(
    () => dataProviders[providerType]?.config,
    [providerType, dataProviders],
  );

  const resetForm = useCallback(() => {
    setProviderType('');
    form.resetFields();
    dispatch(actions.clearEditingSource());
  }, [dispatch, form, actions]);

  useEffect(() => {
    resetForm();
    if (sourceId === 'add') {
      setFormType(CommonFormTypes.Add);
    } else {
      setFormType(CommonFormTypes.Edit);
      dispatch(getSource(sourceId));
    }
  }, [dispatch, resetForm, sourceId]);

  useEffect(() => {
    if (editingSource) {
      const { name, type, config } = editingSource;
      try {
        setProviderType(type);
        form.setFieldsValue({ name, type, config: JSON.parse(config) });
      } catch (error) {
        message.error(tg('operation.parseError'));
        throw error;
      }
    }
  }, [form, editingSource, tg]);

  useEffect(() => {
    if (
      dataProviders[providerType]?.config === null &&
      !dataProviderConfigTemplateLoading
    ) {
      dispatch(getDataProviderConfigTemplate(providerType));
    }
  }, [
    dispatch,
    providerType,
    dataProviders,
    dataProviderConfigTemplateLoading,
  ]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const dataProviderChange = useCallback(
    val => {
      setProviderType(val);
      if (dataProviders[val].config === null) {
        dispatch(getDataProviderConfigTemplate(val));
      }
    },
    [dispatch, dataProviders],
  );

  const dbTypeChange = useCallback(
    val => {
      const dbTypeConfig = config?.attributes.find(
        ({ name }) => name === 'dbType',
      );
      if (dbTypeConfig) {
        const selected = dbTypeConfig.options?.find(
          ({ dbType }) => dbType === val,
        );
        if (selected) {
          const { url, driverClass } = selected;
          form.setFieldsValue({ config: { url, driverClass } });
        }
      }
    },
    [config, form],
  );

  const test = useCallback(async () => {
    await form.validateFields();
    const { type, config } = form.getFieldsValue();
    const { name } = dataProviders[type];

    try {
      setTestLoading(true);
      await request<QueryResult>({
        url: '/data-provider/test',
        method: 'POST',
        data: { name, type, properties: config },
      });
      message.success(t('testSuccess'));
    } catch (error) {
      errorHandle(error);
      throw error;
    } finally {
      setTestLoading(false);
    }
  }, [form, dataProviders, t]);

  const subFormTest = useCallback(
    async (config, callback) => {
      const { name } = dataProviders[providerType];
      try {
        setTestLoading(true);
        const { data } = await request<QueryResult>({
          url: '/data-provider/test',
          method: 'POST',
          data: {
            name,
            type: providerType,
            properties:
              providerType === 'FILE'
                ? { path: config.path, format: config.format }
                : config,
            sourceId: editingSource?.id,
          },
        });
        callback(data);
      } catch (error) {
        errorHandle(error);
        throw error;
      } finally {
        setTestLoading(false);
      }
    },
    [dataProviders, providerType, editingSource],
  );

  const formSubmit = useCallback(
    (values: SourceFormModel) => {
      const { config, ...rest } = values;
      let configStr = '';

      try {
        configStr = JSON.stringify(config);
      } catch (error) {
        message.error((error as Error).message);
        throw error;
      }

      switch (formType) {
        case CommonFormTypes.Add:
          dispatch(
            addSource({
              source: { ...rest, orgId, config: configStr },
              resolve: id => {
                message.success(t('createSuccess'));
                history.push(`/organizations/${orgId}/sources/${id}`);
              },
            }),
          );
          break;
        case CommonFormTypes.Edit:
          dispatch(
            editSource({
              source: {
                ...(editingSource as Source),
                ...rest,
                orgId,
                config: configStr,
              },
              resolve: () => {
                message.success(tg('operation.updateSuccess'));
              },
            }),
          );
          break;
        default:
          break;
      }
    },
    [dispatch, history, orgId, editingSource, formType, t, tg],
  );

  const del = useCallback(
    archive => () => {
      dispatch(
        deleteSource({
          id: editingSource!.id,
          archive,
          resolve: () => {
            message.success(
              archive
                ? tg('operation.archiveSuccess')
                : tg('operation.deleteSuccess'),
            );
            history.replace(`/organizations/${orgId}/sources`);
          },
        }),
      );
    },
    [dispatch, history, orgId, editingSource, tg],
  );

  const unarchive = useCallback(() => {
    dispatch(
      unarchiveSource({
        id: editingSource!.id,
        resolve: () => {
          message.success(tg('operation.restoreSuccess'));
          history.replace(`/organizations/${orgId}/sources`);
        },
      }),
    );
  }, [dispatch, history, orgId, editingSource, tg]);

  const titleLabelPrefix = useMemo(
    () => (isArchived ? t('archived') : tg(`modal.title.${formType}`)),
    [isArchived, formType, t, tg],
  );

  return (
    <Authorized
      authority={allowCreate || allowManage}
      denied={<EmptyFiller title={t('noPermission')} />}
    >
      <Wrapper>
        <DetailPageHeader
          title={`${titleLabelPrefix}${t('source')}`}
          actions={
            !isArchived ? (
              <>
                <Button
                  type="primary"
                  loading={saveSourceLoading}
                  onClick={form.submit}
                >
                  {tg('button.save')}
                </Button>
                {formType === CommonFormTypes.Edit && (
                  <Popconfirm
                    title={tg('operation.archiveConfirm')}
                    onConfirm={del(true)}
                  >
                    <Button loading={deleteSourceLoading} danger>
                      {tg('button.archive')}
                    </Button>
                  </Popconfirm>
                )}
              </>
            ) : (
              <>
                <Popconfirm
                  title={tg('operation.restoreConfirm')}
                  onConfirm={unarchive}
                >
                  <Button loading={unarchiveSourceLoading}>
                    {tg('button.restore')}
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title={tg('operation.deleteConfirm')}
                  onConfirm={del(false)}
                >
                  <Button loading={deleteSourceLoading} danger>
                    {tg('button.delete')}
                  </Button>
                </Popconfirm>
              </>
            )
          }
        />
        <Content>
          <Card bordered={false}>
            <Form
              name="source_form_"
              className="detailForm"
              form={form}
              labelAlign="left"
              labelCol={{ offset: 1, span: 5 }}
              wrapperCol={{ span: 8 }}
              onFinish={formSubmit}
            >
              <Form.Item
                name="name"
                label={t('form.name')}
                validateFirst
                rules={[
                  {
                    required: true,
                    message: `${t('form.name')}${tg('validation.required')}`,
                  },
                  {
                    validator: debounce((_, value) => {
                      if (value === editingSource?.name) {
                        return Promise.resolve();
                      }
                      return request({
                        url: `/sources/check/name`,
                        method: 'POST',
                        params: { name: value, orgId },
                      }).then(
                        () => Promise.resolve(),
                        err =>
                          Promise.reject(new Error(err.response.data.message)),
                      );
                    }, DEFAULT_DEBOUNCE_WAIT),
                  },
                ]}
              >
                <Input disabled={isArchived} />
              </Form.Item>
              <Form.Item
                name="type"
                label={t('form.type')}
                rules={[
                  {
                    required: true,
                    message: `${t('form.type')}${tg('validation.required')}`,
                  },
                ]}
              >
                <Select
                  loading={dataProviderListLoading}
                  disabled={isArchived}
                  onChange={dataProviderChange}
                >
                  {Object.keys(dataProviders).map(key => (
                    <Select.Option key={key} value={key}>
                      {key}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {dataProviderConfigTemplateLoading && <LoadingOutlined />}

              {(providerType !== 'FILE' || formType === CommonFormTypes.Edit) &&
                config?.attributes.map(attr => (
                  <ConfigComponent
                    key={`${providerType}_${attr.name}`}
                    attr={attr}
                    form={form}
                    sourceId={editingSource?.id}
                    testLoading={testLoading}
                    disabled={isArchived}
                    allowManage={allowManage}
                    onTest={test}
                    onSubFormTest={subFormTest}
                    onDbTypeChange={dbTypeChange}
                  />
                ))}
            </Form>
          </Card>
        </Content>
      </Wrapper>
    </Authorized>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${SPACE_LG};
  overflow-y: auto;

  .ant-card {
    margin-top: ${SPACE_LG};
    background-color: ${p => p.theme.componentBackground};
    border-radius: ${BORDER_RADIUS};
    box-shadow: ${p => p.theme.shadowBlock};

    &:first-of-type {
      margin-top: 0;
    }
  }

  .detailForm {
    max-width: ${SPACE_TIMES(240)};
    padding-top: ${SPACE_MD};
  }
`;
