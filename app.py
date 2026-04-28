import streamlit as st
import json
import os

# Set page configuration
st.set_page_config(
    page_title="CHEA Rotha | Portfolio",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for a professional look
st.markdown("""
    <style>
    .main {
        background-color: #0e1117;
    }
    .skill-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        margin: 0.25rem;
        border-radius: 9999px;
        background-color: #1e293b;
        color: #fbbf24;
        font-size: 0.875rem;
        border: 1px solid #334155;
    }
    .project-card {
        padding: 1.5rem;
        border-radius: 0.5rem;
        background-color: #1e293b;
        border: 1px solid #334155;
        margin-bottom: 1rem;
    }
    </style>
    """, unsafe_allow_html=True)

# Helper to load data
def load_data():
    if os.path.exists('db.json'):
        with open('db.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

data = load_data()

if data:
    profile = data.get('profile', {})
    
    # Sidebar Profile
    with st.sidebar:
        st.title(profile.get('name', 'CHEA Rotha'))
        st.subheader(profile.get('title', 'Data Scientist'))
        
        st.markdown(f"📍 {profile.get('location', '')}")
        st.markdown(f"📧 [{profile.get('email', '')}](mailto:{profile.get('email', '')})")
        st.markdown(f"📞 {profile.get('phone', '')}")
        
        st.divider()
        st.markdown(f"🔗 [GitHub]({profile.get('github', '#')})")
        st.markdown(f"🔗 [LinkedIn]({profile.get('linkedin', '#')})")
        
    # Main Content
    st.title(f"Welcome to my Portfolio")
    st.markdown(f"### {profile.get('bio', '')}")
    
    st.divider()
    
    # About Me
    st.header("About Me")
    st.write(profile.get('aboutMe', ''))
    
    st.divider()
    
    # Skills
    st.header("Technical Skills")
    skills = data.get('skills', [])
    categories = sorted(list(set(s.get('category') for s in skills if s.get('category'))))
    
    for cat in categories:
        st.subheader(cat)
        cat_skills = [s for s in skills if s.get('category') == cat]
        cols = st.columns(len(cat_skills) if len(cat_skills) < 4 else 4)
        for i, skill in enumerate(cat_skills):
            with cols[i % 4]:
                st.markdown(f"**{skill.get('name')}**")
                st.progress(skill.get('level', 0) / 100)

    st.divider()
    
    # Projects
    st.header("Projects")
    projects = data.get('projects', [])
    for project in projects:
        with st.container():
            st.markdown(f"### {project.get('title')}")
            col1, col2 = st.columns([1, 2])
            with col1:
                img_path = project.get('imageUrl', '')
                if img_path.startswith('/'):
                    img_path = img_path[1:] # Remove leading slash for local access
                if os.path.exists(img_path):
                    st.image(img_path)
                else:
                    st.info("Project Image Placeholder")
            with col2:
                st.write(project.get('description'))
                st.markdown(" ".join([f"<span class='skill-tag'>{tag}</span>" for tag in project.get('tags', [])]), unsafe_allow_html=True)
                if project.get('githubUrl'):
                    st.link_button("View on GitHub", project.get('githubUrl'))
            st.divider()

    # Experience
    st.header("Professional Experience")
    for exp in data.get('experience', []):
        st.subheader(f"{exp.get('title')} @ {exp.get('company')}")
        st.caption(f"{exp.get('startDate')} - {exp.get('endDate')} | {exp.get('location')}")
        st.write(exp.get('description'))
        st.divider()

    # Education
    st.header("Education")
    for edu in data.get('education', []):
        st.subheader(edu.get('institution'))
        st.write(f"**{edu.get('degree')}** in {edu.get('field')}")
        st.caption(f"{edu.get('startDate')} - {edu.get('endDate')}")
        st.write(edu.get('description'))
        st.divider()

else:
    st.error("Error: db.json not found. Please ensure it's in the same directory as app.py.")

st.sidebar.markdown("---")
st.sidebar.caption("© 2026 CHEA Rotha | Built with Streamlit")
