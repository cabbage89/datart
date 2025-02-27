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

import {
  MoreOutlined,
  SendOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { DetailPageHeader } from 'app/components/DetailPageHeader';
import { ShareLinkModal } from 'app/components/VizOperationMenu';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { generateShareLinkAsync } from 'app/utils/fetch';
import { TITLE_SUFFIX } from 'globalConstants';
import React, {
  FC,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StoryContext } from '../contexts/StoryContext';
import { StoryOverLay } from './StoryOverLay';

interface StoryHeaderProps {
  name?: string;

  status?: number;
  publishLoading?: boolean;
  onPublish?: () => void;
  toggleEdit: () => void;
  playStory: () => void;
  allowShare?: boolean;
  allowManage?: boolean;
}
export const StoryHeader: FC<StoryHeaderProps> = memo(
  ({
    name,
    toggleEdit,
    status,
    publishLoading,
    playStory,
    onPublish,

    allowShare,
    allowManage,
  }) => {
    const t = useI18NPrefix(`viz.action`);
    const title = useMemo(() => {
      const base = name || '';
      const suffix = TITLE_SUFFIX[Number(status)]
        ? `[${t(TITLE_SUFFIX[Number(status)])}]`
        : '';
      return base + suffix;
    }, [name, status, t]);
    const isArchived = Number(status) === 0;
    const [showShareLinkModal, setShowShareLinkModal] = useState(false);
    const { stroyBoardId } = useContext(StoryContext);
    const onOpenShareLink = useCallback(() => {
      setShowShareLinkModal(true);
    }, []);

    const onGenerateShareLink = useCallback(
      async (expireDate, enablePassword) => {
        const result = await generateShareLinkAsync(
          expireDate,
          enablePassword,
          stroyBoardId,
          'STORYBOARD',
        );
        return result;
      },
      [stroyBoardId],
    );
    return (
      <DetailPageHeader
        title={title}
        disabled={Number(status) < 2}
        actions={
          <>
            {allowManage && !isArchived && (
              <Button
                key="publish"
                icon={
                  status === 1 ? (
                    <SendOutlined />
                  ) : (
                    <VerticalAlignBottomOutlined />
                  )
                }
                loading={publishLoading}
                onClick={onPublish}
              >
                {status === 1 ? t('publish') : t('unpublish')}
              </Button>
            )}
            {allowManage && !isArchived && (
              <Button key="edit" onClick={toggleEdit}>
                {t('edit')}
              </Button>
            )}
            <Button key="run" onClick={playStory}>
              {t('play')}
            </Button>
            <Dropdown
              overlay={
                <StoryOverLay
                  allowShare={true}
                  onOpenShareLink={onOpenShareLink}
                />
              }
              placement="bottomCenter"
              arrow
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
            {showShareLinkModal && (
              <ShareLinkModal
                visibility={showShareLinkModal}
                onOk={() => setShowShareLinkModal(false)}
                onCancel={() => setShowShareLinkModal(false)}
                onGenerateShareLink={onGenerateShareLink as (any) => any}
              />
            )}
          </>
        }
      />
    );
  },
);

export default StoryHeader;
