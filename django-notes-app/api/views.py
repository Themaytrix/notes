from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response 
from rest_framework.decorators import api_view
from .serializers import NoteSerializer
from .models import Note

# Create your views here.
@api_view(['GET'])
def get_route(request):
    return Response()

@api_view(['GET'])
def get_notes(request):
    # query to get all entry from model
    notes = Note.objects.all().order_by('-updated')
    serializer = NoteSerializer(notes, many=True)
    
    return Response(serializer.data)

@api_view(['GET'])
def get_note(request,pk):
    # query to get the id enntry from model
    notes = Note.objects.get(id=pk)
    
    serializer = NoteSerializer(notes, many=False)
    
    return Response(serializer.data)

@api_view(['POST'])
def create_note(request):
    data = request.data
    note = Note.objects.create(
        body = data['body']
    )
    serializer = NoteSerializer(note, many=False)
    return Response(serializer.data)

@api_view(['PUT'])
def update_note(request,pk):
    data = request.data
    note = Note.objects.get(id=pk)
    # get the instance of the particular data and update it with the request data
    serializer = NoteSerializer(instance=note, data=data)
    
    if serializer.is_valid():
        serializer.save()
        
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_note(request, pk):
    note = Note.objects.get(id=pk)
    note.delete()
    return Response('Note was deleted')
