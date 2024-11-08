from django.urls import path

from .views import get_route,get_note,get_notes,update_note,delete_note,create_note

urlpatterns = [
    path('',get_route,name="routes"),
    path('notes/',get_notes,name='notes'),
    path('notes/create',create_note,name='create_note'),
    path('notes/<str:pk>/update',update_note,name='update_note'),
    path('notes/<str:pk>/delete',delete_note,name='delete_note'),
    path('notes/<str:pk>',get_note, name='note')
]
