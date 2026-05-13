<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Получить список пользователей с фильтрацией и поиском
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Поиск по имени или email
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        // Фильтр по роли
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->select('id', 'name', 'email', 'role')->paginate(15);

        return response()->json($users);
    }

    /**
     * Обновить роль пользователя
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:user,manager,admin'
        ]);

        // Защита главного админа (ID 1)
        if ($user->id === 1 && $request->role !== 'admin') {
            return response()->json(['message' => 'Нельзя изменить роль главного администратора'], 403);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Роль обновлена', 'user' => $user]);
    }

    /**
     * Удалить пользователя
     */
    public function destroy(User $user)
    {
        // Защита главного админа (ID 1)
        if ($user->id === 1) {
            return response()->json(['message' => 'Нельзя удалить главного администратора'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Пользователь удален']);
    }
}
