import { useFetcher } from '@remix-run/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { DialogDescription } from '~/components/ui/dialog';

interface SettingsDialogProps {
    isSettingsVisible: boolean;
    setIsSettingsVisible: (visible: boolean) => void;
    translationPrompt: string;
    dictionaryPrompt: string;
    targetLanguage: string;
    apiKey: string;
    apiBaseUrl: string;
    chatModelName: string;
    embedModelName: string;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isSettingsVisible, setIsSettingsVisible,
    translationPrompt, dictionaryPrompt, targetLanguage, apiKey, apiBaseUrl, chatModelName, embedModelName }) => {
    const { t } = useTranslation();
    const fetcher = useFetcher();
    const [translationPrompt_, setTranslationPrompt] = useState(translationPrompt);
    const [dictionaryPrompt_, setDictionaryPrompt] = useState(dictionaryPrompt);
    const [targetLanguage_, setTargetLanguage] = useState(targetLanguage);
    const [apiKey_, setApiKey] = useState(apiKey);
    const [apiBaseUrl_, setApiBaseUrl] = useState(apiBaseUrl);
    const [chatModelName_, setChatModelName] = useState(chatModelName);
    const [embedModelName_, setEmbedModelName] = useState(embedModelName);
    useEffect(() => {
        // @ts-ignore
        if (fetcher.data?.success) {
            setIsSettingsVisible(false);
            window.location.reload();
        }
    }, [fetcher.data]);
    return (
        <fetcher.Form method="post" action="/settings" id="settings-form">
            <Dialog open={isSettingsVisible} onOpenChange={setIsSettingsVisible}>
                <DialogContent className="sm:max-w-[50%]">
                    <DialogTitle className="h-8 text-center font-semibold text-xl">
                        {t('settingsDialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                    {/* Translation Prompt */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="translation-prompt" className="text-right text-sm font-medium">
                            {t('settingsDialog.translationPromptLabel')}
                        </Label>
                        <Textarea
                            className="col-span-3 h-full border p-2 rounded-md"
                            id="translation-prompt"
                            name="translationPrompt"
                            form="settings-form"
                            placeholder={t('settingsDialog.translationPromptPlaceholder')}
                            value={translationPrompt_}
                            onChange={(e) => setTranslationPrompt(e.target.value)}
                        />
                    </div>

                    {/* Dictionary Prompt */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="dictionary-prompt" className="text-right text-sm font-medium">
                            {t('settingsDialog.dictionaryPromptLabel')}
                        </Label>
                        <Textarea
                            className="col-span-3 h-full border p-2 rounded-md"
                            id="dictionary-prompt"
                            name="dictionaryPrompt"
                            form="settings-form"
                            placeholder={t('settingsDialog.dictionaryPromptPlaceholder')}
                            value={dictionaryPrompt_}
                            onChange={(e) => setDictionaryPrompt(e.target.value)}
                        />
                    </div>

                    {/* Target Language */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="target-language" className="text-right text-sm font-medium">
                            {t('settingsDialog.targetLanguageLabel')}
                        </Label>
                        <Input
                            className="col-span-3 border p-2 rounded-md"
                            type="text"
                            id="target-language"
                            name="targetLanguage"
                            form="settings-form"
                            placeholder={t('settingsDialog.targetLanguagePlaceholder')}
                            value={targetLanguage_}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                        />
                    </div>

                    {/* API Key */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="api-key" className="text-right text-sm font-medium">
                            {t('settingsDialog.apiKeyLabel')}
                        </Label>
                        <Input
                            className="col-span-3 border p-2 rounded-md"
                            type="text"
                            id="api-key"
                            name="apiKey"
                            form="settings-form"
                            placeholder={t('settingsDialog.apiKeyPlaceholder')}
                            value={apiKey_}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>

                    {/* API Base URL */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="api-base-url" className="text-right text-sm font-medium">
                            {t('settingsDialog.apiBaseUrlLabel')}
                        </Label>
                        <Input
                            className="col-span-3 border p-2 rounded-md"
                            type="text"
                            id="api-base-url"
                            name="apiBaseUrl"
                            form="settings-form"
                            placeholder={t('settingsDialog.apiBaseUrlPlaceholder')}
                            value={apiBaseUrl_}
                            onChange={(e) => setApiBaseUrl(e.target.value)}
                        />
                    </div>

                    {/* Chat Model Name */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="chat-model-name" className="text-right text-sm font-medium">
                            {t('settingsDialog.chatModelNameLabel')}
                        </Label>
                        <Input
                            className="col-span-3 border p-2 rounded-md"
                            type="text"
                            id="chat-model-name"
                            name="chatModelName"
                            form="settings-form"
                            placeholder={t('settingsDialog.chatModelNamePlaceholder')}
                            value={chatModelName_}
                            onChange={(e) => setChatModelName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2 items-center">
                        <Label htmlFor="embed-model-name" className="text-right text-sm font-medium">
                            {t('settingsDialog.embedModelNameLabel')}
                        </Label>
                        <Input
                            className="col-span-3 border p-2 rounded-md"
                            type="text"
                            id="embed-model-name"
                            name="embedModelName"
                            form="settings-form"
                            placeholder={t('settingsDialog.embedModelNamePlaceholder')}
                            value={embedModelName_}
                            onChange={(e) => setEmbedModelName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="settings-form">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </fetcher.Form >
    );
}

export default SettingsDialog;