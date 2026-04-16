<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[\Illuminate\Database\Eloquent\Attributes\Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public const ROLE_USER = 'user';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_ADMIN = 'admin';

    public function isAdmin(): bool {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isManager(): bool {
        return $this->role === self::ROLE_MANAGER || $this->isAdmin();
    }
}
