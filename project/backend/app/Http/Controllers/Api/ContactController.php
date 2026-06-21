<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UnisenderGoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request, UnisenderGoService $unisender): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:200',
            'message' => 'required|string|min:10|max:5000',
        ], [
            'name.required' => 'Укажите имя.',
            'name.max' => 'Имя не должно превышать 100 символов.',
            'email.required' => 'Укажите email.',
            'email.email' => 'Укажите корректный email.',
            'subject.max' => 'Тема не должна превышать 200 символов.',
            'message.required' => 'Напишите сообщение.',
            'message.min' => 'Сообщение должно содержать не менее 10 символов.',
            'message.max' => 'Сообщение не должно превышать 5000 символов.',
        ]);

        try {
            $unisender->sendContactMessage([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'] ?? null,
                'message' => $validated['message'],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        return response()->json(['message' => 'Сообщение отправлено']);
    }
}
