  async editCallModerator({
    eventCallBoothId,
    data,
    eventSponsorId,
    createdBy,
  }: {
    eventCallBoothId: string;
    data: EditCallModeratorDto;
    eventSponsorId?: string;
    createdBy: string;
  }) {
    try {
      const sponsorCondition = eventSponsorId ? { eventSponsorId } : {};
      const [booth, currentCallModerators] = await Promise.all([
        this.CallBoothModel.findOne({
          where: { ...sponsorCondition, id: eventCallBoothId },
        }),

        this.CallModeratorModel.findAll({ where: { eventCallBoothId } }),
      ]);

      if (!booth) throw new NotFoundException(Call_02);

      const { emails = [] } = data;
      const users = await Promise.all(
        emails.map(async email => {
          return this.userService.findOrCreate({
            condition: { email: { [Op.like]: email } },
            defaultData: {
              email,
              status: UserStatus.PENDING,
              type: UserType.USER,
            },
          });
        }),
      );
      const userIds = users.map(user => user.id);

      const currentModeratorIds = currentCallModerators.map(
        currentCallModerator => currentCallModerator.userId,
      );
      const addingModeratorIds = _.difference(userIds, currentModeratorIds);
      const removeModeratorIds = _.difference(currentModeratorIds, userIds);

      const addingModeratorData = addingModeratorIds.map(addingModeratorId => {
        return {
          eventId: booth.eventId,
          eventCallBoothId,
          eventSponsorId,
          userId: addingModeratorId,
          createdBy,
        };
      });

      const [, addingCallModerators] = await Promise.all([
        this.CallModeratorModel.destroy({
          where: {
            eventId: booth.eventId,
            eventCallBoothId,
            eventSponsorId,
            userId: { [Op.in]: removeModeratorIds },
          },
        }),

        this.CallModeratorModel.bulkCreate(addingModeratorData),
      ]);

      await Promise.all([
        this.queueService.addLiveEventProcess(
          LiveEventProcessType.Call_Moderator_EDITED,
          {
            eventId: booth.eventId,
            CallId: eventCallBoothId,
            addingModeratorIds,
            removeModeratorIds,
          },
          {
            jobId: `${
              LiveEventProcessType.Call_Moderator_EDITED
            }:${new Date().getTime()}`,
          },
        ),

        this.queueService.addNewEventProcess(
          EventProcessType.Call_Moderator_UPDATED,
          {
            eventId: booth.eventId,
            addingModeratorIds: addingCallModerators.map(
              CallModerator => CallModerator.id,
            ),
          },
          {
            jobId: `${
              EventProcessType.Call_Moderator_UPDATED
            }:${new Date().getTime()}`,
          },
        ),
      ]);

      return addingCallModerators;
    } catch (error) {
      throw error;
    }
  }