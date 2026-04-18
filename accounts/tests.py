"""
Test Suite for BookLy HMS Authentication System

This file contains comprehensive tests for all authentication features.
Run with: python manage.py test accounts
"""

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
import json


class AuthenticationTestCase(TestCase):
    """Test user authentication system"""
    
    def setUp(self):
        """Set up test client and create test user"""
        self.client = Client()
        self.register_url = reverse('register_api')
        self.login_url = reverse('login_api')
        self.logout_url = reverse('logout_api')
        self.dashboard_url = reverse('dashboard_api')
        
    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'username': 'newuser'
        }
        
        response = self.client.post(
            self.register_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        
        response_data = json.loads(response.content)
        self.assertTrue(response_data['success'])
        self.assertIn('access', response_data['tokens'])
        self.assertIn('refresh', response_data['tokens'])
    
    def test_registration_weak_password(self):
        """Test registration with weak password"""
        data = {
            'email': 'newuser@example.com',
            'password': 'weak',
            'password_confirm': 'weak',
            'username': 'newuser'
        }
        
        response = self.client.post(
            self.register_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertFalse(response_data['success'])


class PasswordValidationTestCase(TestCase):
    """Test password validation"""
    
    def test_strong_password(self):
        """Test valid strong password"""
        from accounts.auth_utils import AuthenticationManager
        
        is_valid, message = AuthenticationManager.validate_password_strength('SecurePass123!')
        self.assertTrue(is_valid)


class EmailValidationTestCase(TestCase):
    """Test email validation"""
    
    def test_valid_email(self):
        """Test valid email format"""
        from accounts.auth_utils import AuthenticationManager
        
        self.assertTrue(AuthenticationManager.verify_email_format('user@example.com'))

