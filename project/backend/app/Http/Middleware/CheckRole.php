<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
{
    if (!$request->user()) {
        return response()->json(['message' => 'Не авторизован'], 401);
    }

    $userRole = $request->user()->role;
    
    // Админ имеет доступ ко всему
    if ($userRole === 'admin') {
        return $next($request);
    }
    
    // Иначе проверяем точное совпадение
    if ($userRole !== $role) {
        abort(403, 'Доступ запрещён. Недостаточно прав.');
    }

    return $next($request);
}
}