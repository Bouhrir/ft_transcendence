from django.contrib import admin
from .models import Message
from .models import Invitation

# Register your models here.
@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('inviter', 'invitee', 'room_name', 'status')  # Fields to display in the list
    list_filter = ('status',)  # Filter options for the admin list view
    search_fields = ('inviter__username', 'invitee__username', 'room_name')  # Search functionality
# Register your models here.

admin.site.register(Message)