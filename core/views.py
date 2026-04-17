from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required




def index_page(request):
    return HttpResponse("API IS running")