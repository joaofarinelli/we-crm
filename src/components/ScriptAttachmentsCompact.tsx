import { Paperclip, Link, ExternalLink, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScriptAttachments, ScriptAttachment } from '@/hooks/useScriptAttachments';

interface ScriptAttachmentsCompactProps {
  scriptId: string;
}

export const ScriptAttachmentsCompact = ({ scriptId }: ScriptAttachmentsCompactProps) => {
  const { attachments } = useScriptAttachments(scriptId);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = async (attachment: ScriptAttachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <h5 className="text-xs font-medium text-gray-600 flex items-center gap-1">
        <Paperclip className="w-3 h-3" />
        Anexos ({attachments.length})
      </h5>
      <div className="space-y-1">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-gray-50/50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {attachment.type === 'file' ? (
                <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0" />
              ) : (
                <Link className="w-3 h-3 text-blue-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer text-left truncate block w-full"
                  title={attachment.type === 'file' ? 'Clique para visualizar o arquivo' : 'Clique para abrir o link'}
                >
                  {attachment.name}
                </button>
                {attachment.type === 'file' && attachment.file_size && (
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {attachment.type === 'file' ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    title="Visualizar arquivo"
                    className="h-6 w-6 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(attachment)}
                    title="Baixar arquivo"
                    className="h-6 w-6 p-0"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                  title="Abrir link"
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};