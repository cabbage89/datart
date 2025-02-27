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

import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Menu, message, Popconfirm, TreeDataNode } from 'antd';
import { MenuListItem, Popup, Tree, TreeTitle } from 'app/components';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { CascadeAccess } from 'app/pages/MainPage/Access';
import { selectOrgId } from 'app/pages/MainPage/slice/selectors';
import { CommonFormTypes } from 'globalConstants';
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getInsertedNodeIndex, onDropTreeFn, stopPPG } from 'utils/utils';
import { isParentIdEqual } from '../../../slice/utils';
import {
  PermissionLevels,
  ResourceTypes,
} from '../../PermissionPage/constants';
import { SaveFormContext } from '../SaveFormContext';
import {
  selectCurrentEditingViewKey,
  selectViewListLoading,
  selectViews,
} from '../slice/selectors';
import {
  deleteView,
  getViews,
  removeEditingView,
  updateViewBase,
} from '../slice/thunks';

interface FolderTreeProps {
  treeData?: TreeDataNode[];
}

export const FolderTree = memo(({ treeData }: FolderTreeProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showSaveForm } = useContext(SaveFormContext);
  const loading = useSelector(selectViewListLoading);
  const currentEditingViewKey = useSelector(selectCurrentEditingViewKey);
  const orgId = useSelector(selectOrgId);
  const viewsData = useSelector(selectViews);
  const t = useI18NPrefix('view.form');
  const tg = useI18NPrefix('global');

  useEffect(() => {
    dispatch(getViews(orgId));
  }, [dispatch, orgId]);

  const redirect = useCallback(
    currentEditingViewKey => {
      if (currentEditingViewKey) {
        history.push(`/organizations/${orgId}/views/${currentEditingViewKey}`);
      } else {
        history.push(`/organizations/${orgId}/views`);
      }
    },
    [history, orgId],
  );

  const archive = useCallback(
    (id, isFolder) => e => {
      e.stopPropagation();
      dispatch(
        deleteView({
          id,
          archive: !isFolder,
          resolve: () => {
            dispatch(removeEditingView({ id, resolve: redirect }));
            message.success(
              isFolder
                ? tg('operation.deleteSuccess')
                : tg('operation.archiveSuccess'),
            );
          },
        }),
      );
    },
    [dispatch, redirect, tg],
  );

  const moreMenuClick = useCallback(
    ({ id, name, parentId, index }) =>
      ({ key, domEvent }) => {
        domEvent.stopPropagation();
        switch (key) {
          case 'info':
            showSaveForm({
              type: CommonFormTypes.Edit,
              visible: true,
              simple: true,
              initialValues: {
                id,
                name,
                parentId,
              },
              parentIdLabel: t('folder'),
              onSave: (values, onClose) => {
                if (isParentIdEqual(parentId, values.parentId)) {
                  index = getInsertedNodeIndex(values, viewsData);
                }

                dispatch(
                  updateViewBase({
                    view: {
                      id,
                      ...values,
                      parentId: values.parentId || null,
                      index,
                    },
                    resolve: onClose,
                  }),
                );
              },
            });
            break;
          case 'delete':
            break;
          default:
            break;
        }
      },
    [dispatch, showSaveForm, viewsData, t],
  );

  const renderTreeTitle = useCallback(
    node => {
      return (
        <TreeTitle>
          <h4>{`${node.title}`}</h4>
          <CascadeAccess
            module={ResourceTypes.View}
            path={node.path}
            level={PermissionLevels.Manage}
          >
            <Popup
              trigger={['click']}
              placement="bottom"
              content={
                <Menu
                  prefixCls="ant-dropdown-menu"
                  selectable={false}
                  onClick={moreMenuClick(node)}
                >
                  <MenuListItem
                    key="info"
                    prefix={<EditOutlined className="icon" />}
                  >
                    {tg('button.info')}
                  </MenuListItem>
                  <MenuListItem
                    key="delete"
                    prefix={<DeleteOutlined className="icon" />}
                  >
                    <Popconfirm
                      title={
                        node.isFolder
                          ? tg('operation.deleteConfirm')
                          : tg('operation.archiveConfirm')
                      }
                      onConfirm={archive(node.id, node.isFolder)}
                    >
                      {node.isFolder
                        ? tg('button.delete')
                        : tg('button.archive')}
                    </Popconfirm>
                  </MenuListItem>
                </Menu>
              }
            >
              <span className="action" onClick={stopPPG}>
                <MoreOutlined />
              </span>
            </Popup>
          </CascadeAccess>
        </TreeTitle>
      );
    },
    [archive, moreMenuClick, tg],
  );

  const treeSelect = useCallback(
    (_, { node }) => {
      if (!node.isFolder && node.id !== currentEditingViewKey) {
        history.push(`/organizations/${orgId}/views/${node.id}`);
      }
    },
    [history, orgId, currentEditingViewKey],
  );

  const onDrop = info => {
    onDropTreeFn({
      info,
      treeData,
      callback: (id, parentId, index) => {
        dispatch(
          updateViewBase({
            view: {
              id,
              parentId,
              index: index,
              name: info.dragNode.name,
            },
            resolve: () => {},
          }),
        );
      },
    });
  };

  return (
    <Tree
      loading={loading}
      treeData={treeData}
      titleRender={renderTreeTitle}
      selectedKeys={[currentEditingViewKey]}
      onSelect={treeSelect}
      defaultExpandAll
      onDrop={onDrop}
      draggable
    />
  );
});
