
from django.db.models import Q
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from teams.models import Team, TeamMember
from teams.helpers import get_team
from common.exceptions import Conflict, BadRequest, InternalServerError
from .models import Invite
from .helpers import verify_invite, verify_team_leader


class BaseEndpoint(APIView):
    # Create invite
    def post(self, request):
        team_id = request.data['team_id']
        user_id = request.data['user_id']

        try:
            with transaction.atomic():
                team = Team.objects.filter(
                    team_id=team_id).only('leader').first()
                verify_team_leader(team, request.user)

                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    raise BadRequest(message='Invalid user_id')

                if Invite.objects.filter(
                    Q(user_id=user_id)
                    & Q(team_id=team_id)
                ).exists():
                    # User has already been invited
                    return Response(data={'message': 'Invited'}, status=201)

                if TeamMember.objects.filter(
                    Q(user=user_id)
                    & Q(team=team_id)
                ).exists():
                    raise Conflict(message='User is already in team')

                new_invite = Invite(team=team, user=user)
                new_invite.save()
        except IntegrityError:
            raise InternalServerError(
                message='Some error occurred. Could not invite.')

        return Response(data={'message': 'Invited'}, status=201)

    # Withdraw invite
    def delete(self, request):
        team_id = request.data.get('team_id')
        user_id = request.data.get('user_id')

        try:
            with transaction.atomic():
                team = Team.objects.filter(
                    team_id=team_id).only('leader').first()

                verify_team_leader(team, request.user)

                if not User.objects.filter(id=user_id).exists():
                    raise NotFound({'message': 'User not found.'})

                invite = Invite.objects.filter(
                    Q(user=user_id)
                    & Q(team=team_id)
                ).first()

                if not invite:
                    raise NotFound({'message': 'Invite does not exist.'})

                invite.delete()
        except IntegrityError:
            raise InternalServerError(
                message='Some error occurred. Could not withdraw invite.')

        return Response(data={'message': 'Invite has been withdrawn'})


class AcceptInvite(APIView):
    def patch(self, _, invite_id):
        invite = Invite.objects.get(id=invite_id)

        try:
            with transaction.atomic():
                invite = verify_invite(invite)

                joined_user = TeamMember(team=invite.team, user=invite.user)
                joined_user.save()

                team = get_team(invite.team.team_id)
                team.member_count += 1

                team.save()
                invite.delete()
        except IntegrityError:
            raise InternalServerError(
                message='Some error occurred. Could not accept invite.')

        return Response(data={'message': 'Invite accepted'})


class RejectInvite(APIView):
    def patch(self, _, invite_id):
        invite = Invite.objects.get(id=invite_id)

        try:
            with transaction.atomic():
                invite = verify_invite(invite)
                invite.delete()
        except IntegrityError:
            raise InternalServerError(
                message='Some error occurred. Could not reject invite.')

        return Response(data={'message': 'Invite rejected'})
