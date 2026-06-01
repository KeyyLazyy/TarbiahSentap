<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDevice extends Model
{
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'verified_at',
        'verification_code',
        'code_expires_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'code_expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
