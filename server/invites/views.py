
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Invite, InviteStatus
from teams.models import Team, TeamMember
from users.models import User
from common.exceptions import Conflict, BadRequest
from teams.helpers import get_team
from .helpers import verify_invite, verify_team_leader


class BaseEndpoint(APIView):
    # Create invite
    def post(self, request):
        team_id = request.POST['team_id']
        user_id = request.POST['user_id']

        team = Team.objects.filter(team_id=team_id).first()

        verify_team_leader(team, request.auth_user)

        user = User.objects.filter(user_id=user_id).first()

        if not user:
            raise BadRequest({'message': 'Invalid user_id'})

        if TeamMember.objects.filter(
            Q(user=user_id)
            & Q(team=team_id)
        ).exists():
            raise Conflict({'message': 'User is already in team'})

        if Invite.objects.filter(
            Q(user_id=user_id)
            & Q(team_id=team_id)
            & Q(status=InviteStatus.PENDING)
        ).exists():
            raise Conflict({'message': 'User has already been invited'})

        new_invite = Invite(team=team, user=user)
        new_invite.save()

        return Response({'message': 'Invited'}, status=201)

    # Withdraw invite
    def delete(self, request):
        team_id = request.data.get('team_id')
        user_id = request.data.get('user_id')

        team = Team.objects.filter(team_id=team_id).only('leader').first()

        verify_team_leader(team, request.auth_user)

        if not User.objects.filter(user_id=user_id).exists():
            raise BadRequest({'message': 'Invalid user_id'})

        invite = Invite.objects.filter(
            Q(user_id=user_id)
            & Q(team_id=team_id)
            & Q(status=InviteStatus.PENDING)
        ).first()

        if not invite:
            raise BadRequest({'message': 'No such invite exists'})

        invite.delete()
        return Response({'message': 'Invite has been withdrawn'}, status=200)


class AcceptInvite(APIView):
    def patch(self, req, invite_id):
        invite = Invite.objects.filter(id=invite_id).first()

        invite = verify_invite(invite)

        # TODO: wrap this in a transaction

        invite.status = InviteStatus.ACCEPTED
        invite.save()

        joined_user = TeamMember(team=invite.team, user=invite.user)
        joined_user.save()

        team = get_team(invite.team.team_id)
        team.member_count += 1
        team.save()

        return Response({'message': 'Invite accepted'}, status=200)


class RejectInvite(APIView):
    def patch(self, req, invite_id):
        invite = Invite.objects.filter(id=invite_id).first()

        invite = verify_invite(invite)

        invite.status = InviteStatus.REJECTED
        invite.save()

        return Response({'message': 'Invite rejected'}, status=200)
