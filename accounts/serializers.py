from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Hotel


class HotelSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Hotel
        fields = [
            "id",
            "hotel_name",
            "mobile_number",
            "is_active",
            "created_at",
            "updated_at",
            "logo_url",
        ]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.hotel_logo and hasattr(obj.hotel_logo, "url"):
            if request is not None:
                return request.build_absolute_uri(obj.hotel_logo.url)
            return obj.hotel_logo.url
        return None


class UserSerializer(serializers.ModelSerializer):
    hotel = HotelSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "hotel",
        ]


class RegisterSerializer(serializers.Serializer):
    hotel_logo = serializers.CharField(required=False, allow_blank=True)
    hotel_name = serializers.CharField()
    email = serializers.EmailField()
    mobile_number = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

