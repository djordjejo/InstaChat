using FluentValidation;

namespace Application.Conversations.Commands.CreateChat
{
    public class CreateConversationQueryValidator : AbstractValidator<CreateConversationQuery>
    {
        public CreateConversationQueryValidator()
        {
            RuleFor(x => x.MemberIds)
                .NotNull().WithMessage("Lista članova je obavezna.")
                .Must(ids => ids is { Count: > 0 })
                    .WithMessage("Razgovor mora imati bar jednog člana.")
                // Duplikat u listi je ranije rusio Commit: primarni kljuc
                // ConversationMember-a je (UserId, ConversationId), pa bi dva
                // ista ID-a dala duplicate key i 500.
                .Must(ids => ids == null || ids.Distinct().Count() == ids.Count)
                    .WithMessage("Lista članova sadrži duplikate.");

            RuleForEach(x => x.MemberIds)
                .NotEmpty().WithMessage("ID člana nije ispravan.");

            // Naziv je obavezan samo za grupu. Kod 1-na-1 razgovora se ne koristi -
            // ime se racuna po ucesniku (ConversationExtensions.DisplayNameFor).
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Naziv grupe je obavezan.")
                .MaximumLength(100).WithMessage("Naziv grupe može imati najviše 100 karaktera.")
                .When(x => x.IsGroup);
        }
    }
}
