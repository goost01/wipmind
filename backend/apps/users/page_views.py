from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required


def index_redirect(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')


def login_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'login.html')


def register_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'register.html')
