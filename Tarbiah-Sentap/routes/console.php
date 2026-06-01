<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('send-mail', function () {
    Mail::raw('Congrats for sending test email with Laravel!', function ($message) {
        $message->to('aimansuhaimi124@gmail.com')
                ->subject('You are awesome!');
    });
    $this->info('Email sent successfully!');
})->purpose('Send test email');
