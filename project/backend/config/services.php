<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'unisender_go' => [
        'api_key' => env('UNISENDER_GO_API_KEY'),
        'api_url' => env('UNISENDER_GO_API_URL', 'https://goapi.unisender.ru/ru/transactional/api/v1/'),
        'contact_to' => env('CONTACT_TO_EMAIL'),
        'contact_from_email' => env('CONTACT_FROM_EMAIL'),
        'contact_from_name' => env('CONTACT_FROM_NAME', env('APP_NAME', 'Tech Lab')),
        'ca_bundle' => env('UNISENDER_GO_CA_BUNDLE', storage_path('certs/cacert.pem')),
        'verify_ssl' => env('UNISENDER_GO_VERIFY_SSL'),
    ],

];
