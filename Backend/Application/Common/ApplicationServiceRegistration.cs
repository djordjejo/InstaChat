using Application.Common.Behaviors;
using Application.Conversations.Commands.CreateChat;
using Application.Messages.Command;
using Application.Users.Commands.Queries.LogIn;
using Application.Users.Commands.Register;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Application.Common
{
    public static class ApplicationServiceRegistration
    {
        /// <summary>
        /// Registruje validatore i ukljucuje ih u MediatR pipeline.
        /// Validatori se navode rucno umesto AddValidatorsFromAssembly, da se ne
        /// uvodi jos jedan NuGet paket (FluentValidation.DependencyInjectionExtensions).
        /// Uz ovoliko requestova lista je pregledna, a i vidi se sta je pokriveno.
        /// </summary>
        public static IServiceCollection AddApplicationValidation(this IServiceCollection services)
        {
            services.AddScoped<IValidator<RegisterCommand>, RegisterCommandValidator>();
            services.AddScoped<IValidator<LoginQuery>, LoginQueryValidator>();
            services.AddScoped<IValidator<SendMessageCommand>, SendMessageCommandValidator>();
            services.AddScoped<IValidator<SendImageMessageCommand>, SendImageMessageCommandValidator>();
            services.AddScoped<IValidator<EditMessageCommand>, EditMessageCommandValidator>();
            services.AddScoped<IValidator<CreateConversationQuery>, CreateConversationQueryValidator>();

            // Otvoreni generik: MediatR ga zatvori za svaki par (TRequest, TResponse).
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

            return services;
        }
    }
}
