<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Socket extends Model
{
    protected $table = 'sockets';
    protected $fillable = ['name'];
    public $timestamps = false; // убери, если в таблице есть created_at/updated_at
}