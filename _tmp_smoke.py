import json
import uuid
import requests

base = 'http://127.0.0.1:4000'
inst_user = 'inst_' + uuid.uuid4().hex[:6]
inst = requests.post(base + '/api/auth/signup', json={'username': inst_user, 'password': '12345678', 'role': 'instructor', 'name': '강사A'}).json()
inst_headers = {'Authorization': 'Bearer ' + inst['accessToken']}
mat = requests.post(base + '/api/materials', headers=inst_headers, data={'subjectId': 'subject-1', 'title': '테스트 강의자료'}, files={'file': ('note.txt', b'hello world')}).json()
post = requests.post(base + '/api/community/posts', headers=inst_headers, json={'subjectId': 'subject-1', 'title': '공지', 'content': '수업 공지입니다.'}).json()
reply = requests.post(base + f"/api/community/posts/{post['id']}/replies", headers=inst_headers, json={'content': '확인했습니다.'}).json()

stu_user = 'stu_' + uuid.uuid4().hex[:6]
stu = requests.post(base + '/api/auth/signup', json={'username': stu_user, 'password': '12345678', 'role': 'student', 'name': '학생A', 'email': stu_user + '@test.local', 'grade': '고1'}).json()
stu_headers = {'Authorization': 'Bearer ' + stu['accessToken']}
requests.post(base + '/api/auth/link-instructor', headers=stu_headers, json={'instructorCode': inst['instructorCode']}).raise_for_status()
boot = requests.get(base + '/api/bootstrap', headers=stu_headers).json()
submission = requests.post(base + '/api/submissions', headers=stu_headers, json={'id': 'sub-' + uuid.uuid4().hex[:6], 'studentId': stu['studentId'], 'assignmentId': 'assign-1', 'score': 88, 'submittedAt': '2026-04-13', 'answerText': '답안입니다.'}).json()
updated = requests.put(base + f"/api/submissions/{submission['id']}", headers=inst_headers, json={'score': 90, 'feedback': '좋습니다.'}).json()

print(json.dumps({
    'materialId': mat['id'],
    'postId': post['id'],
    'replyId': reply['id'],
    'bootMaterials': len(boot['materials']),
    'submissionScore': updated['score'],
    'submissionFeedback': updated['feedback'],
}, ensure_ascii=False))
