import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

def create_system_architecture_flowchart():
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Title
    ax.text(5, 9.5, 'EduFlow System Architecture', fontsize=20, fontweight='bold', ha='center')
    
    # User Layer
    user_box = FancyBboxPatch((0.5, 7.5), 9, 1.2, boxstyle="round,pad=0.1", 
                               facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=2)
    ax.add_patch(user_box)
    ax.text(5, 8.1, 'USER LAYER', fontsize=14, fontweight='bold', ha='center')
    
    # User Types
    students = FancyBboxPatch((0.8, 7.7), 2.5, 0.4, boxstyle="round,pad=0.05", 
                              facecolor='#BBDEFB', edgecolor='#1565C0')
    staff = FancyBboxPatch((3.7, 7.7), 2.5, 0.4, boxstyle="round,pad=0.05", 
                           facecolor='#BBDEFB', edgecolor='#1565C0')
    admin = FancyBboxPatch((6.6, 7.7), 2.5, 0.4, boxstyle="round,pad=0.05", 
                           facecolor='#BBDEFB', edgecolor='#1565C0')
    
    ax.add_patch(students)
    ax.add_patch(staff)
    ax.add_patch(admin)
    
    ax.text(2.05, 7.9, 'Students', fontsize=11, ha='center')
    ax.text(4.95, 7.9, 'Staff', fontsize=11, ha='center')
    ax.text(7.85, 7.9, 'Admin', fontsize=11, ha='center')
    
    # Application Layer
    app_box = FancyBboxPatch((0.5, 5.5), 9, 1.5, boxstyle="round,pad=0.1", 
                             facecolor='#F3E5F5', edgecolor='#7B1FA2', linewidth=2)
    ax.add_patch(app_box)
    ax.text(5, 6.7, 'APPLICATION LAYER', fontsize=14, fontweight='bold', ha='center')
    
    # Modules
    student_mod = FancyBboxPatch((0.8, 5.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                                facecolor='#E1BEE7', edgecolor='#6A1B9A')
    staff_mod = FancyBboxPatch((3.7, 5.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                              facecolor='#E1BEE7', edgecolor='#6A1B9A')
    admin_mod = FancyBboxPatch((6.6, 5.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                               facecolor='#E1BEE7', edgecolor='#6A1B9A')
    
    ax.add_patch(student_mod)
    ax.add_patch(staff_mod)
    ax.add_patch(admin_mod)
    
    ax.text(2.05, 6.2, 'Student Module', fontsize=10, ha='center')
    ax.text(4.95, 6.2, 'Staff Module', fontsize=10, ha='center')
    ax.text(7.85, 6.2, 'Admin Module', fontsize=10, ha='center')
    
    # Service Layer
    service_box = FancyBboxPatch((0.5, 3.5), 9, 1.5, boxstyle="round,pad=0.1", 
                                 facecolor='#E8F5E8', edgecolor='#388E3C', linewidth=2)
    ax.add_patch(service_box)
    ax.text(5, 4.7, 'SERVICE LAYER', fontsize=14, fontweight='bold', ha='center')
    
    # Services
    auth_service = FancyBboxPatch((0.8, 3.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                                  facecolor='#C8E6C9', edgecolor='#2E7D32')
    ai_service = FancyBboxPatch((3.7, 3.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                               facecolor='#C8E6C9', edgecolor='#2E7D32')
    data_service = FancyBboxPatch((6.6, 3.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                                 facecolor='#C8E6C9', edgecolor='#2E7D32')
    
    ax.add_patch(auth_service)
    ax.add_patch(ai_service)
    ax.add_patch(data_service)
    
    ax.text(2.05, 4.2, 'Authentication', fontsize=10, ha='center')
    ax.text(4.95, 4.2, 'AI Assistant', fontsize=10, ha='center')
    ax.text(7.85, 4.2, 'Data Service', fontsize=10, ha='center')
    
    # Database Layer
    db_box = FancyBboxPatch((0.5, 1.5), 9, 1.5, boxstyle="round,pad=0.1", 
                            facecolor='#FFF3E0', edgecolor='#F57C00', linewidth=2)
    ax.add_patch(db_box)
    ax.text(5, 2.7, 'DATABASE LAYER', fontsize=14, fontweight='bold', ha='center')
    
    # Database Tables
    users_db = FancyBboxPatch((0.8, 1.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                              facecolor='#FFE0B2', edgecolor='#E65100')
    academic_db = FancyBboxPatch((3.7, 1.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                                facecolor='#FFE0B2', edgecolor='#E65100')
    system_db = FancyBboxPatch((6.6, 1.8), 2.5, 0.8, boxstyle="round,pad=0.05", 
                               facecolor='#FFE0B2', edgecolor='#E65100')
    
    ax.add_patch(users_db)
    ax.add_patch(academic_db)
    ax.add_patch(system_db)
    
    ax.text(2.05, 2.2, 'Users/Profiles', fontsize=10, ha='center')
    ax.text(4.95, 2.2, 'Academic Data', fontsize=10, ha='center')
    ax.text(7.85, 2.2, 'System Config', fontsize=10, ha='center')
    
    # External Services
    external_box = FancyBboxPatch((0.5, 0.2), 9, 1, boxstyle="round,pad=0.1", 
                                 facecolor='#FFEBEE', edgecolor='#D32F2F', linewidth=2)
    ax.add_patch(external_box)
    ax.text(5, 0.7, 'EXTERNAL SERVICES', fontsize=14, fontweight='bold', ha='center')
    
    # External Services
    supabase = FancyBboxPatch((1.5, 0.3), 2, 0.4, boxstyle="round,pad=0.05", 
                              facecolor='#FFCDD2', edgecolor='#C62828')
    payment = FancyBboxPatch((4, 0.3), 2, 0.4, boxstyle="round,pad=0.05", 
                             facecolor='#FFCDD2', edgecolor='#C62828')
    ai_api = FancyBboxPatch((6.5, 0.3), 2, 0.4, boxstyle="round,pad=0.05", 
                            facecolor='#FFCDD2', edgecolor='#C62828')
    
    ax.add_patch(supabase)
    ax.add_patch(payment)
    ax.add_patch(ai_api)
    
    ax.text(2.5, 0.5, 'Supabase', fontsize=10, ha='center')
    ax.text(5, 0.5, 'Payment Gateway', fontsize=10, ha='center')
    ax.text(7.5, 0.5, 'AI APIs', fontsize=10, ha='center')
    
    # Connections
    arrows = [
        ((2.05, 7.7), (2.05, 6.6)),  # Students to Student Module
        ((4.95, 7.7), (4.95, 6.6)),  # Staff to Staff Module
        ((7.85, 7.7), (7.85, 6.6)),  # Admin to Admin Module
        ((2.05, 5.8), (2.05, 4.6)),  # Student Module to Auth
        ((4.95, 5.8), (4.95, 4.6)),  # Staff Module to AI Service
        ((7.85, 5.8), (7.85, 4.6)),  # Admin Module to Data Service
        ((2.05, 3.8), (2.05, 2.6)),  # Auth to Users DB
        ((4.95, 3.8), (4.95, 2.6)),  # AI to Academic DB
        ((7.85, 3.8), (7.85, 2.6)),  # Data to System DB
        ((2.05, 1.8), (2.5, 0.7)),   # Users to Supabase
        ((4.95, 1.8), (5, 0.7)),     # Academic to Payment
        ((7.85, 1.8), (7.5, 0.7)),   # System to AI APIs
    ]
    
    for start, end in arrows:
        ax.annotate('', xy=end, xytext=start,
                   arrowprops=dict(arrowstyle='->', lw=1.5, color='#555'))
    
    plt.tight_layout()
    plt.savefig('c:\\Users\\aravi\\Downloads\\eduflow-ai-main\\eduflow-ai-main\\flowcharts\\system_architecture.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    create_system_architecture_flowchart()
