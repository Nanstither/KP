<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class UnisenderGoService
{
    public function sendContactMessage(array $data): void
    {
        $apiKey = config('services.unisender_go.api_key');
        $apiUrl = config('services.unisender_go.api_url');
        $toEmail = config('services.unisender_go.contact_to');
        $fromEmail = config('services.unisender_go.contact_from_email');
        $fromName = config('services.unisender_go.contact_from_name');

        if (! $apiKey || ! $toEmail || ! $fromEmail) {
            throw new \RuntimeException('Сервис отправки сообщений не настроен. Обратитесь к администратору.');
        }

        $subjectLine = $data['subject']
            ? '[Tech Lab] Сообщение с сайта: '.$data['subject']
            : '[Tech Lab] Сообщение с сайта: Без темы';

        $plainBody = implode("\n", [
            'Новое сообщение с формы обратной связи',
            '',
            'Имя: '.$data['name'],
            'Email: '.$data['email'],
            'Тема: '.($data['subject'] ?: '—'),
            '',
            'Сообщение:',
            $data['message'],
        ]);

        $htmlBody = nl2br(htmlspecialchars($plainBody, ENT_QUOTES, 'UTF-8'));

        try {
            $response = Http::withOptions($this->httpOptions())
                ->withHeaders([
                    'X-API-KEY' => $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post(rtrim($apiUrl, '/').'/email/send.json', [
                    'message' => [
                        'recipients' => [
                            ['email' => $toEmail],
                        ],
                        'body' => [
                            'html' => $htmlBody,
                            'plaintext' => $plainBody,
                        ],
                        'subject' => $subjectLine,
                        'from_email' => $fromEmail,
                        'from_name' => $fromName,
                        'reply_to' => $data['email'],
                        'reply_to_name' => $data['name'],
                    ],
                ]);
        } catch (ConnectionException $e) {
            \Log::warning('Unisender Go connection error', ['message' => $e->getMessage()]);

            throw new \RuntimeException(
                config('app.debug')
                    ? 'Ошибка SSL/сети при обращении к Unisender Go. Проверьте UNISENDER_GO_CA_BUNDLE или UNISENDER_GO_VERIFY_SSL=false в .env для локальной разработки.'
                    : 'Не удалось отправить сообщение. Попробуйте позже.'
            );
        }

        if (! $response->successful()) {
            $apiError = $response->json('message')
                ?? $response->json('error')
                ?? $response->body();

            \Log::warning('Unisender Go API error', [
                'status' => $response->status(),
                'body' => $apiError,
            ]);

            $message = config('app.debug') && is_string($apiError) && $apiError !== ''
                ? 'Unisender Go: '.$apiError
                : 'Не удалось отправить сообщение. Попробуйте позже.';

            throw new \RuntimeException($message);
        }
    }

    private function httpOptions(): array
    {
        $verifySsl = config('services.unisender_go.verify_ssl');

        if ($verifySsl === false || $verifySsl === 'false' || $verifySsl === '0') {
            return ['verify' => false];
        }

        $caBundle = config('services.unisender_go.ca_bundle');

        if (is_string($caBundle) && $caBundle !== '' && file_exists($caBundle)) {
            return ['verify' => $caBundle];
        }

        return [];
    }
}
