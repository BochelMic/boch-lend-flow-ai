
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Copy, Share2, QrCode, MessageCircle, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';

const FormSharing = () => {
  const [formUrl] = useState(`${window.location.origin}/credit-form/form`);
  const [shortUrl, setShortUrl] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const generateShortUrl = () => {
    // Simular geração de URL curta
    const shortId = Math.random().toString(36).substring(7);
    const generatedShortUrl = `https://short.link/${shortId}`;
    setShortUrl(generatedShortUrl);
    toast({
      title: "URL curta gerada",
      description: "Link curto criado com sucesso!",
    });
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Você pode solicitar seu crédito através deste link: ${formUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Formulário de Pedido de Crédito');
    const body = encodeURIComponent(
      `Olá!\n\nVocê pode solicitar seu crédito através do seguinte link:\n${formUrl}\n\nObrigado!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Solicite seu crédito: ${formUrl}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(formUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent('Formulário de Pedido de Crédito');
    const url = encodeURIComponent(formUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(formUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const generateQRCode = () => {
    // Abrir gerador de QR Code online
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Formulário
          </CardTitle>
          <CardDescription>
            Obtenha links e compartilhe o formulário de pedido de crédito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Original */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link do Formulário</label>
            <div className="flex gap-2">
              <Input value={formUrl} readOnly className="flex-1" />
              <Button onClick={() => copyToClipboard(formUrl)} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* URL Curta */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link Curto</label>
            <div className="flex gap-2">
              <Input 
                value={shortUrl} 
                readOnly 
                placeholder="Clique em 'Gerar' para criar um link curto"
                className="flex-1" 
              />
              <Button onClick={generateShortUrl} variant="outline">
                Gerar
              </Button>
              {shortUrl && (
                <Button onClick={() => copyToClipboard(shortUrl)} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Código QR</label>
            <Button onClick={generateQRCode} variant="outline" className="w-full">
              <QrCode className="h-4 w-4 mr-2" />
              Gerar Código QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compartilhamento Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Compartilhamento Rápido</CardTitle>
          <CardDescription>
            Compartilhe diretamente nas plataformas mais populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={shareViaWhatsApp} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button onClick={shareViaSMS} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <span className="text-sm">SMS</span>
            </Button>

            <Button onClick={shareViaEmail} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Mail className="h-6 w-6 text-red-600" />
              <span className="text-sm">Email</span>
            </Button>

            <Button onClick={shareViaFacebook} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Facebook className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Facebook</span>
            </Button>

            <Button onClick={shareViaTwitter} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Twitter className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Twitter</span>
            </Button>

            <Button onClick={shareViaLinkedIn} variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Linkedin className="h-6 w-6 text-blue-700" />
              <span className="text-sm">LinkedIn</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Integração com Site</CardTitle>
          <CardDescription>
            Copie o código HTML para incorporar o formulário em seu site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Código HTML (iframe)</label>
            <div className="relative">
              <textarea
                readOnly
                value={`<iframe src="${formUrl}" width="100%" height="800" frameborder="0"></iframe>`}
                className="w-full h-20 p-3 border rounded-md bg-gray-50 text-sm font-mono"
              />
              <Button 
                onClick={() => copyToClipboard(`<iframe src="${formUrl}" width="100%" height="800" frameborder="0"></iframe>`)}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Link Direto (HTML)</label>
            <div className="relative">
              <textarea
                readOnly
                value={`<a href="${formUrl}" target="_blank">Solicitar Crédito</a>`}
                className="w-full h-16 p-3 border rounded-md bg-gray-50 text-sm font-mono"
              />
              <Button 
                onClick={() => copyToClipboard(`<a href="${formUrl}" target="_blank">Solicitar Crédito</a>`)}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSharing;
